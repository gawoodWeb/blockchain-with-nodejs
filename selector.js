// ═══════════════════════════════════════════════════════════════
//  UTXO COIN SELECTION — Algorithme de sélection optimale
//
//  Stratégie : Branch and Bound inspiré de Bitcoin Core
//  Paramètres clés :
//    - WASTE_RATIO     : si un UTXO seul dépasse X fois le montant → chercher combo
//    - FEE_PER_INPUT   : coût en frais d'ajouter un input supplémentaire
//    - DUST_THRESHOLD  : montant minimum pour un change output (évite le dust)
//    - MAX_INPUTS      : limite pour éviter des TX trop lourdes
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  WASTE_RATIO:    2.0,   // si utxo > montant × 2  → tenter combo plus proche
  FEE_PER_INPUT:  0.01,  // frais par input ajouté (sat/vbyte simplifié)
  DUST_THRESHOLD: 0.5,   // change en dessous de ce seuil = dust (ignoré)
  MAX_INPUTS:     7,     // max inputs dans une TX
}


// ─── Types de résultat ────────────────────────────────────────
// { utxos, total, change, waste, strategy }


// ─── Utilitaires ─────────────────────────────────────────────

function totalOf(utxos) {
  return utxos.reduce((s, u) => s + parseFloat(u.value), 0)
}

function feeOf(utxos) {
  return utxos.length * CONFIG.FEE_PER_INPUT
}

// "Waste" = change + frais — on veut minimiser ça
function wasteOf(utxos, target) {
  const total  = totalOf(utxos)
  const fee    = feeOf(utxos)
  const change = total - target - fee
  return change + fee  // on pénalise aussi les frais
}


// ═══════════════════════════════════════════════════════════════
//  STRATÉGIE 1 — Exact Match (correspondance exacte ou quasi)
//  Trouve un UTXO unique ou une combo qui couvre exactement
//  le montant ± dust_threshold
// ═══════════════════════════════════════════════════════════════
function exactMatch(utxos, target) {
  const tol = CONFIG.DUST_THRESHOLD
  const fee1 = CONFIG.FEE_PER_INPUT  // frais pour 1 input

  // UTXO unique dans la fenêtre exacte
  const single = utxos.find(u => {
    const v = parseFloat(u.value)
    return v >= target + fee1 && v <= target + fee1 + tol
  })
  if (single) return { utxos: [single], strategy: 'EXACT_SINGLE' }

  // Combo de 2 dans la fenêtre exacte (Branch & Bound léger)
  for (let i = 0; i < utxos.length; i++) {
    for (let j = i + 1; j < utxos.length; j++) {
      const combo = [utxos[i], utxos[j]]
      const total = totalOf(combo)
      const fee   = feeOf(combo)
      if (total >= target + fee && total <= target + fee + tol) {
        return { utxos: combo, strategy: 'EXACT_PAIR' }
      }
    }
  }

  return null
}


// ═══════════════════════════════════════════════════════════════
//  STRATÉGIE 2 — Branch and Bound (BnB)
//  Explore toutes les combinaisons jusqu'à MAX_INPUTS
//  Garde celle avec le moins de waste
// ═══════════════════════════════════════════════════════════════
function branchAndBound(utxos, target) {
  const sorted  = [...utxos].sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
  let best      = null
  let bestWaste = Infinity

  function bnb(index, current) {
    const total = totalOf(current)
    const fee   = feeOf(current)

    if (total >= target + fee) {
      const waste = wasteOf(current, target)
      if (waste < bestWaste) {
        bestWaste = waste
        best = [...current]
      }
      return  // on a trouvé une solution valide → pas besoin d'aller plus loin
    }

    if (index >= sorted.length)           return
    if (current.length >= CONFIG.MAX_INPUTS) return

    // Branche 1 : on prend cet UTXO
    bnb(index + 1, [...current, sorted[index]])
    // Branche 2 : on ne le prend pas
    bnb(index + 1, current)
  }

  bnb(0, [])
  return best ? { utxos: best, strategy: 'BRANCH_AND_BOUND' } : null
}


// ═══════════════════════════════════════════════════════════════
//  STRATÉGIE 3 — Greedy Accumulate
//  Fallback : prend les plus grands UTXOs jusqu'à couvrir le montant
//  Toujours valide, jamais optimal
// ═══════════════════════════════════════════════════════════════
function greedyAccumulate(utxos, target) {
  const sorted = [...utxos].sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
  const selected = []

  for (const u of sorted) {
    selected.push(u)
    const fee = feeOf(selected)
    if (totalOf(selected) >= target + fee) {
      return { utxos: selected, strategy: 'GREEDY' }
    }
  }

  return null  // fonds insuffisants
}


// ═══════════════════════════════════════════════════════════════
//  STRATÉGIE 4 — Single Large UTXO check
//  Si un UTXO unique couvre le montant mais est trop grand
//  (> WASTE_RATIO × target), on signale qu'une combo est préférable
// ═══════════════════════════════════════════════════════════════
function singleLargeCheck(utxos, target) {
  const candidates = utxos
    .filter(u => parseFloat(u.value) >= target + CONFIG.FEE_PER_INPUT)
    .sort((a, b) => parseFloat(a.value) - parseFloat(b.value))  // le plus petit d'abord

  if (!candidates.length) return null

  const best = candidates[0]
  const ratio = parseFloat(best.value) / target

  return {
    utxos: [best],
    strategy: 'SINGLE_LARGE',
    oversize: ratio > CONFIG.WASTE_RATIO  // signale si trop grand
  }
}


// ═══════════════════════════════════════════════════════════════
//  SÉLECTEUR PRINCIPAL
//  Orchestre les stratégies dans l'ordre optimal
// ═══════════════════════════════════════════════════════════════
function selectCoins(utxoList, target) {
  target = parseFloat(target)

  // Sanitize : convertir les valeurs en float, filtrer les invalides
  const utxos = utxoList
    .map(u => ({ ...u, value: parseFloat(u.value) }))
    .filter(u => u.value > 0)

  const available = totalOf(utxos)
  const minFee    = CONFIG.FEE_PER_INPUT

  // ── Vérification préalable ──────────────────────────────────
  if (available < target + minFee) {
    return { ok: false, error: 'INSUFFICIENT_FUNDS', available, target }
  }

  // ── Étape 1 : Exact match (zéro change = parfait) ──────────
  const exact = exactMatch(utxos, target)
  if (exact) {
    return buildResult(exact, target, 'Correspondance exacte — aucun change')
  }

  // ── Étape 2 : Branch and Bound (optimal, waste minimal) ────
  const bnb = branchAndBound(utxos, target)

  // ── Étape 3 : Single large UTXO ────────────────────────────
  const single = singleLargeCheck(utxos, target)

  // ── Décision : BnB vs Single ────────────────────────────────
  // Si le single UTXO est trop grand (ratio > WASTE_RATIO)
  // ET que BnB trouve une solution avec moins de waste → préférer BnB
  if (bnb && single) {
    const bnbWaste    = wasteOf(bnb.utxos, target)
    const singleWaste = wasteOf(single.utxos, target)

    if (single.oversize && bnbWaste < singleWaste) {
      return buildResult(bnb, target, `BnB préféré (single trop grand × ${(parseFloat(single.utxos[0].value) / target).toFixed(1)})`)
    }

    // Si le single n'est pas oversized → le préférer (moins de frais)
    if (!single.oversize) {
      return buildResult(single, target, 'UTXO unique suffisant')
    }

    return buildResult(bnb, target, 'Branch & Bound optimal')
  }

  if (bnb)    return buildResult(bnb,    target, 'Branch & Bound')
  if (single) return buildResult(single, target, 'UTXO unique (seule option)')

  // ── Fallback : Greedy ───────────────────────────────────────
  const greedy = greedyAccumulate(utxos, target)
  if (greedy) return buildResult(greedy, target, 'Greedy (fallback)')

  return { ok: false, error: 'NO_SOLUTION' }
}


// ─── Construit l'objet résultat final ─────────────────────────
function buildResult({ utxos, strategy }, target, note) {
  const total  = totalOf(utxos)
  const fee    = feeOf(utxos)
  const change = total - target - fee

  return {
    ok:       true,
    strategy,
    note,
    inputs:   utxos,
    summary: {
      inputCount:  utxos.length,
      totalInput:  +total.toFixed(8),
      target:      +target.toFixed(8),
      fee:         +fee.toFixed(8),
      change:      +(change < CONFIG.DUST_THRESHOLD ? 0 : change).toFixed(8),
      dustBurned:  change > 0 && change < CONFIG.DUST_THRESHOLD ? +change.toFixed(8) : 0,
      wasteScore:  +wasteOf(utxos, target).toFixed(8),
    }
  }
}


// ═══════════════════════════════════════════════════════════════
//  TESTS
// ═══════════════════════════════════════════════════════════════

function printResult(label, result) {
  console.log(`\n${'═'.repeat(58)}`)
  console.log(` ${label}`)
  console.log('═'.repeat(58))

  if (!result.ok) {
    console.log(` ✗ ERREUR : ${result.error}`)
    return
  }

  console.log(` ✔ Stratégie  : ${result.strategy}`)
  console.log(`   Note       : ${result.note}`)
  console.log(`   Inputs (${result.summary.inputCount})  : [ ${result.inputs.map(u => u.value).join(' + ')} ]`)
  console.log(`   Total input : ${result.summary.totalInput}`)
  console.log(`   Cible       : ${result.summary.target}`)
  console.log(`   Frais       : ${result.summary.fee}`)
  console.log(`   Change      : ${result.summary.change}`)
  if (result.summary.dustBurned > 0)
    console.log(`   Dust brûlé  : ${result.summary.dustBurned}`)
  console.log(`   Waste score : ${result.summary.wasteScore}`)
}

/*
// ── Cas 1 : Alice envoie 30 avec ses deux UTXOs de 40 ─────────
const aliceUTXOs = [
  { n: '0', value: '40', scriptPubKey: 'f744b734b47ab1815e0dc7d902bc99f08c2df920' },
  { n: '0', value: '40', scriptPubKey: 'f744b734b47ab1815e0dc7d902bc99f08c2df920' },
]


printResult('Alice → Bob : 30  (UTXOs: [40, 40])', selectCoins(aliceUTXOs, 30))


// ── Cas 2 : Liste mixte, envoyer 20 ───────────────────────────
const mixedUTXOs = [10, 68, 45, 4, 8].map((v, i) => ({ n: String(i), value: String(v), scriptPubKey: 'abc' + i }))
printResult('Envoi 20  (UTXOs: [10, 68, 45, 4, 8])', selectCoins(mixedUTXOs, 20))


// ── Cas 3 : Exact match possible ──────────────────────────────
const exactUTXOs = [5, 15, 30, 10].map((v, i) => ({ n: String(i), value: String(v), scriptPubKey: 'xyz' + i }))
printResult('Envoi 14  (UTXOs: [5, 15, 30, 10])', selectCoins(exactUTXOs, 14))


// ── Cas 4 : Fonds insuffisants ────────────────────────────────
const poorUTXOs = [5, 3].map((v, i) => ({ n: String(i), value: String(v), scriptPubKey: 'poor' + i }))
printResult('Envoi 100 (UTXOs: [5, 3])', selectCoins(poorUTXOs, 100))


// ── Cas 5 : Large liste, trouver combo optimale ───────────────
const richUTXOs = [2, 7, 13, 25, 50, 1, 3, 6].map((v, i) => ({ n: String(i), value: String(v), scriptPubKey: 'rich' + i }))
printResult('Envoi 15  (UTXOs: [2, 7, 13, 25, 50, 1, 3, 6])', selectCoins(richUTXOs, 15))

*/
// ─── Export ───────────────────────────────────────────────────
module.exports = { selectCoins, CONFIG }

