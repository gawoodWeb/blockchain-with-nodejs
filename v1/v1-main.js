
let peter = {
	id : 1,
	name: "peter"
};

let jack = {
	id : 2,
	name: "jack",
    adress: "",
    public_key: ""
};

let Banque = {
    id : 0,
    name: "banque",
    address: "",
    public_key: ""

};





let trasaction = {
  id: 0,
  from: 0,
  to: 2,
  amount: 10
}

let packet = {
    address : "",
    public_key : "",
    trasaction,
    signature: ""
}

let USERS = [
    ["001", "100"],
    ["002", "200"],
    ["003", "300"],
    ["004", "400"],
    ["005", "500"],
]


let Transactions = []
let i = 0;

function MAKE_TRANSACTION (from,to,amount,signature, address){

    if (FORMALITY_VALIDATION(from,to) !== true ){
        console.log( "oups")
        return

    } 


    if(from !== 0) {
        if(VALIDATE_TRANSACTION(from, amount)){
            
            if (SIGNED_TRANSACTION(signature, address)) {
                Transactions.push({
                    id: i++,
                    from,
                    to,
                    amount
                })

                console.log("Transaction validated!");

            } else {

                console.log("Transactions signature not validate!")
            }



        } else {
            
            console.log("Transactions not validate!")
        }

    }
    else {
        console.log("Transactions validate!")

            if (SIGNED_TRANSACTION(signature, address)) {
                Transactions.push({
                    id: i++,
                    from,
                    to,
                    amount
                })

                console.log("Transactions validate!")
            } else {

                console.log("Transactions signature not validate!")
            }

    }

    console.log(Transactions)
}

function FORMALITY_VALIDATION(from,to){
    if(from === to ) {
        console.log("You can't send token to yourself!")
        return false
    }
    else if ( to === 0 ) { 
        console.log("You can't send token to the system!")
        return false 
    }
    else {
        return true
    }
}

function VALIDATE_TRANSACTION (from,amount){

    let sold = 0
    Transactions.forEach((item)=>{
        if(item.to == from || item.from == from ){
            console.log("Yes" , from, "is indicated!", item.id);

            if(from == item.to){
                sold += item.amount
                console.log(sold, item)
            }
            else {
                sold -= item.amount
                console.log(sold, item)
            }
                
        }
    })

    console.log(from, sold)

    return sold >= amount
}

function SOLD (id){

    if(id == 0 ) return true 
    let sold = 0;
     Transactions.forEach((item)=>{
        if(item.to == id || item.from == id ){
            if( id == item.to){
                sold += item.amount
                console.log(item.id ," Transaction " , id ,"receive ", item.amount , "from ", item.from , "only", sold, "left!" )
            }
            else {
                sold -= item.amount

                console.log(item.id , " Transaction " , id ,"sent ", item.amount , "to ", item.to , "only", sold, "left!" )
            }
                
        }
    })

    console.log("Now", id ,'is ', sold ,'Token left')
}


function SIGNED_TRANSACTION(signature, address){
    let users = USERS.fond((user)=>{
        return user[0] == adress;
    }) 

    let public_key = users[1];

    console.log("Publickey", pubkey, "of", users[0]);
}

function VERIFY_SIGNATURE(public_key, signature){

    return yes
    
}


function SIGNED_TRANSACTION(signature, address){
    let users = USERS.fond((user)=>{
        return user[0] == adress;
    }) 

    let public_key = users[1];

    console.log("Publickey", pubkey, "of", users[0]);
}

function VERIFY_SIGNATURE(public_key, signature){

    return yes
    
}


MAKE_TRANSACTION(0,1,25)
MAKE_TRANSACTION(0,2,25)
MAKE_TRANSACTION(0,3,25)
MAKE_TRANSACTION(1,2,5)
MAKE_TRANSACTION(3,1,30)
MAKE_TRANSACTION(3,2,10)


MAKE_TRANSACTION(1,4,10)
MAKE_TRANSACTION(3,3,7)
MAKE_TRANSACTION(2,1,13)
MAKE_TRANSACTION(4,0,13)
MAKE_TRANSACTION(4,3,8)


SOLD(0)
SOLD(1)
SOLD(2)
SOLD(3)
SOLD(4)



    









