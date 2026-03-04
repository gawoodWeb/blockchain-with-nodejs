let USERS = [
    ["001", "100"],
    ["002", "200"],
    ["003", "300"],
    ["004", "400"],
    ["005", "500"],
];

let QUES = [];

let BLOCKS = [
    {
        transaction : {
            from: "000",
            to: "001",
            amount: 50
        },
        signature: "ihvbduuke78974gk"
    },
    {
        transaction : {
            from: "000",
            to: "002",
            amount: 150
        },
        signature: "xvke7t7ve8974gk"
    },
    {
        transaction : {
            from: "000",
            to: "003",
            amount: 60
        },
        signature: "heuxvke78974gk"
    },
]



class Transaction {
    constructor( from,to,amount){
        console.log("yur",from,to,amount)
    }

}


class Packet {
    constructor(transaction,sig){

    }
}

class Machine {
    
    constructor(name,address){
        this.name = name;
        this.address = address  
        this.kyc  = true;
        this.genpkey()
        this.genAddress()
        this.MemePool();
    }

    genpkey () {

        this.private_key = "kpsujzuz"
    }

    genAddress () {
        //this.address = "kzjehdihe"
    }


    MemePool(){
        
        this.memePool = []

    }

    Blocks () {

        this.blocks = []
    }

    Transaction (to, amount){
        let tr = new Transaction(this,to, amount );

        console.log("tr")

    }
}



let peter = new Machine("peter","001")
let alice = new Machine("alice","002")


peter.Transaction("002",20)


//==================================//
//      EVERYONE IN THE SYSTEM
//==================================// 
//==================================// 




function MAKE_TRANSACTION (from, to, amount) {

    if ( ! FORMALITY_VALIDATION(from,to)) return false

    return { from, to, amount }

}

function FIND_PUBLIC_KEY(){

}

function SIGNED_PACKET (transaction, private_key) {
    let exec = "openssl dgst -rsa256 -sign -in private.key -out signature transaction";
    return "ytydhiioihdgh7574ug747rg6"
}

function MAKE_PACKET(transaction, private_key){
    return {
        transaction,
        signature : SIGNED_PACKET(transaction,private_key)
    }
}

function SEND_PACKET (p) {
    QUES.push(p)
}

//==================================//
//      EVERYONE IN THE SYSTEM 
//==================================// 
//==================================// 


function ADD_TO_BLOCK () { 
    console.log("7553");
    QUES.forEach((packet)=>{

        if (VALIDATE_TRANSACTION(packet) && VERIFY_SIGNATURE(packet)) {
            BLOCKS.push(packet);
        }

    })
}

function VALIDATE_TRANSACTION (packet){
    let from = packet.transaction.from;
    let amount = packet.transaction.amount;

    let sold = 0

    // console.log('ueud', from)
    if( ! BLOCKS.length > 0 && from !== "000") {
        console.log("list < 1 NV");
        return false
    }
    else if( ! BLOCKS.length > 0 && from === "000"){
        console.log("yfuh")

    } else {
        return HAVE_FUNDS(from, amount);
    }

}




function FORMALITY_VALIDATION (from, to){
    return from !== to && to !== "000"
}



function HAVE_FUNDS (from, amount){
    let sold = 0;
        let lists = BLOCKS.filter(({transaction})=>{
            let item = transaction;
            if(item.from == from ) return item
            if(item.to == from ) return item
        })
            .map(item=>item.transaction)

        lists.forEach((item)=>{
                if(item.from == from ) {
                    return sold = sold - item.amount
                }
                if(item.to == from ) {
                    return sold = sold + item.amount
                }
            })

        // console.log("Track",lists, sold)
        return sold >= amount
}






function VERIFY_SIGNATURE (packet) {
    let tr = packet.transaction;
    let pubkey = packet.transaction.from;
    let exec = "openssl dgst -sha256 -verify ...";
    return true
}


function FOUND_PUBLICKEY () {} 



function Transac (from, to, amount ){
    let transaction1 = MAKE_TRANSACTION(from,to,amount);
    let packet = MAKE_PACKET(transaction1, "rifvsuug");
    SEND_PACKET(packet);
}


Transac("001","002",30)
Transac("001","003",30)
Transac("003","002",30)
Transac("004","001",30)
Transac("001","002",30)



ADD_TO_BLOCK();
console.log(BLOCKS, QUES)






























