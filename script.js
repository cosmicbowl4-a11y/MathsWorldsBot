const symbols = [
"+","−","×","÷","π","√","=",
"▲","●","■","⬟","⬢"
]

const container = document.getElementById("symbols")

for(let i=0;i<30;i++){

let s = document.createElement("div")

s.className="symbol"

s.innerText = symbols[Math.floor(Math.random()*symbols.length)]

s.style.left = Math.random()*100+"%"
s.style.top = Math.random()*100+"%"

s.style.animationDelay = Math.random()*10+"s"

container.appendChild(s)

}

function startGame(){

document.body.style.transition="0.4s"
document.body.style.transform="scale(0.9)"
document.body.style.opacity="0"

setTimeout(()=>{
console.log("Game Start")
},400)

}
