
let base_url = "https://swdestinydb.com/api/public/"
let deck_submit_btn = document.querySelector("#deck_submit_btn") 
let graph_btn = document.querySelector("#graph_btn") 
let user_deck_id = document.querySelector("#user_deck_id").value
let opp_deck_id = document.querySelector("#opp_deck_id").value
let user_char_arr = [] 
let opp_char_arr = [] 
let opp_char = []
let user_char = []
let user_deck_cards = []
let opp_deck_cards = []
let card_data = {}
let opp_dmg = 0
let user_dmg = 0

let turn_slide = document.querySelector("#turn_slide")
let turns = document.querySelector("#turn_value")
turns.innerText = turn_slide.value


class Character {
    constructor(id, name, sides, health){
        this.id = id
        this.name = name
        this.sides = sides
        this.health = health
        this.char_dmg = 0
    }
    
    calc_dmg(){
        let dmg = 0
        let dmg_side = 0

        for(let i=0;i<this.sides.length;i++){
            if(this.sides[i].includes("MD") || this.sides[i].includes("RD") || this.sides[i].includes("ID")){
                let side = /\d[A-Z]/gm.exec(this.sides[i])
                dmg += parseInt(side[0].charAt(0))
                dmg_side++
            }
        }
        this.char_dmg = dmg_side ? dmg/dmg_side : 0

        return this.char_dmg
    }
    
    give_upgrade(){
        return
    }
    
    get_damage(){
        return this.calc_dmg() 
    }

    get_wrecked(){
        return
    }
}


deck_submit_btn.addEventListener("click", () => {
    process_data(user_deck_id, opp_deck_id)
})

graph_btn.addEventListener("click", () => {
    get_curve(turns.innerText)
})


turn_slide.oninput = function() {
    turns.innerText = this.value
}


function process_data(deck_id, opp_deck){
    axios
        .all([get_card_promise(deck_id, "decklist/"), get_card_promise(opp_deck, "decklist/")]) 
        .then(decks => {
            user_char = decks[0]["data"]["characters"]
            user_deck_cards = decks[0]["data"]["slots"]
            opp_char = decks[1]["data"]["characters"]
            opp_deck_cards = decks[1]["data"]["slots"]
            var cards = Object.assign({}, user_char, user_deck_cards, opp_char, opp_deck_cards)
            
            let card_promises = []
            Object.keys(cards).forEach(card => {
                card_promises.push(get_card_promise(card, "card/"))
            })

            axios
                .all(card_promises)
                .then(axios.spread((...args) => {
                    for(let card_obj of args){
                        card_data[card_obj["data"]["code"]] = card_obj["data"]
                    }
                    assign_chars(user_char, true)
                    assign_chars(opp_char, false)
                    console.log(user_char_arr[0].get_damage()) 
                    console.log(opp_char_arr[0].get_damage()) 
                    get_curve(turns.innerText)
                }))
        })
}


function assign_chars(chars, user){
    let char_arr = user ? user_char_arr : opp_char_arr
    let dupe = "abcde"
    var fixed_ids = []

    for(let char_id of Object.keys(chars)){
        let i = 0 
        while(i<chars[char_id]["quantity"]){
            fixed_ids.push(char_id + dupe.charAt(i))
            i++
        }
    }
    
    for(const [i, fixed_id] of fixed_ids.entries()){
        let char_id = fixed_id.slice(0, 5)
        char_arr[i] = new Character(
            char_id, 
            card_data[char_id]["name"], 
            card_data[char_id]["sides"],
            card_data[char_id]["health"],
        )
    }
}


// reference is card/deck id number, loc is the location of the resource for the destinydb API
function get_card_promise(reference, loc){
    let url = base_url + loc + reference 
    return axios.get(url, {"Access-Control-Allow-Origin": "*"})
}


function get_curve(turns){
    if(document.querySelector(".curve")){
        d3.select(".curve").remove()
    }

    let margin = {top: 10, right: 30,  bottom: 30, left: 60}
    let width = 460 - margin.left - margin.right
    let height = 400 - margin.top - margin.bottom

    let svg = d3.select(".chart")
        .append("svg")
            .attr("class", "curve")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
    let x = d3.scaleLinear().range([0, width])
    let y = d3.scaleLinear().range([height, 0])

    x.domain([1,turns])
    y.domain([0,d3.max([turns * 6])])

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(turns))
        
    svg.append("g")
        .call(d3.axisLeft(y))

    opp_dmg = calc_dmg(opp_char)    
    user_dmg = calc_dmg(user_char)
    data_to_curve(format_data(opp_dmg), "#a33639")
    data_to_curve(format_data(user_dmg), "#0071C5")

    
    function calc_dmg(chars){
        let avg_dmgs = {}
        let dupe = "abcde"

        for(let char_id of Object.keys(chars)){
            let i = 0 
            while(i<chars[char_id]["quantity"]){
                avg_dmgs[char_id + dupe.charAt(i)] = 0
                i++
            }
        }

        for(let char_id of Object.keys(avg_dmgs)){
            let dmg = 0
            let dmg_side = 0
            let sides = card_data[char_id.slice(0,5)]["sides"]

            for(let i=0;i<sides.length;i++){
                if(sides[i].includes("MD") || sides[i].includes("RD") || sides[i].includes("ID")){
                    side = /\d[A-Z]/gm.exec(sides[i])
                    dmg += parseInt(side[0].charAt(0))
                    dmg_side++
                }
            }
            avg_dmgs[char_id] = dmg_side ? dmg/dmg_side : 0
        }
        console.log(avg_dmgs)
        return avg_dmgs
    }


// Returns object with character id as key and avg dmg per turn as value.
// Id is appended with letter to differentiate multiples 
    function format_data(damages){
        let formatted = []
        let dmg = 0

        for(let key in damages){
            dmg += damages[key]
        }
        for(let i=0;i<turns;i++){
            formatted.push({ "x":i+1, "y":dmg * (i+1) })
        }
        return formatted
    }


    function data_to_curve(data, color){
        svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
        .x(function(d) { return x(d.x) })
        .y(function(d) { return y(d.y) })
        )

        svg.append("g")
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
                .attr("cx", function(d) { return x(d.x) })
                .attr("cy", function(d) { return y(d.y) })
                .attr("r", 5)
                .attr("fill", color)
    }

    generate_characters("#opp_chars")
    function generate_characters(player_div){
        let char_wrap = document.querySelector(player_div)

        for(let [i, char] of user_char_arr.entries()){
            console.log("----------")
            console.log(char)

            let char_div = document.createElement("div")
            char_div.className = "character"
            char_div.id = "character" + toString(i)
            char_div.innerText = char.name
            char_wrap.appendChild(char_div)

            let char_toggle = document.createElement("input")
            char_toggle.id = "toggle" + toString(i)
            char_toggle.type = "checkbox"
            char_toggle.innerText = "Target"
            char_div.appendChild(char_toggle)

            char_toggle.addEventListener("change", () => {
                if(char_toggle.checked){
                    user_char_arr[i].get_wrecked()
                }
            })
        }
    }


}

