
let base_url = "https://swdestinydb.com/api/public/"
let deck_submit_btn = document.querySelector("#deck_submit_btn") 
let graph_btn = document.querySelector("#graph_btn") 
let user_deck_id = document.querySelector("#user_deck_id").value
let opp_deck_id = document.querySelector("#opp_deck_id").value
let user_char_arr = [] 
let opp_char_arr = [] 
let card_data = {}
let priority_set = false
let user_hp = 0
let opp_hp = 0

let turn_slide = document.querySelector("#turn_slide")
let turns = document.querySelector("#turn_value")
turns.innerText = turn_slide.value

let user_target = {}
let opp_target = {}


class Character {
    constructor(id, name, sides, health){
        this.id = id
        this.name = name
        this.sides = sides
        this.health = health
        this.char_dmg = 0
        this.alive = true
        this.priority = 0

        this.calc_dmg()
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
    }

    assign_pri(pri){
        this.priority = pri
    }
    
    give_upgrade(){
        return
    }
    
    get_damage(){
        return this.char_dmg
    }

    reset_char() {
        this.calc_dmg()
        this.alive = true
    }

    get_wrecked(){
        this.char_dmg = 0
        this.alive = false
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
            let user_char = decks[0]["data"]["characters"]
            let user_deck_cards = decks[0]["data"]["slots"]
            let opp_char = decks[1]["data"]["characters"]
            let opp_deck_cards = decks[1]["data"]["slots"]
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
                    get_curve(turns.innerText)
                }))
        })
}


function assign_chars(chars, user){
    let char_arr = user ? user_char_arr : opp_char_arr
    let dupe = "abcdefgh"
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
    return axios.get(url, { "Access-Control-Allow-Origin": "*" })
}


function reset(){
    user_target = {}
    opp_target = {}
    user_hp = 0
    opp_hp = 0

    for(let char of opp_char_arr){
        char.reset_char()
    }
    for(let char of user_char_arr){
        char.reset_char()
    }
}


function get_curve(turns){
    reset()
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

    generate_characters("#opp_chars", opp_char_arr)
    generate_characters("#user_chars", user_char_arr)
    let turn_dmgs = get_turn_dmg() 
    data_to_curve(format_data(turn_dmgs["opp"]), "#a33639") 
    data_to_curve(format_data(turn_dmgs["user"]), "#0071C5")  


// refactor repetitions
    function get_turn_dmg(){
        let opp_turn_dmgs = [0]
        let user_turn_dmgs = [0]

        for(let i=0;i<turns;i++){
            let user_total_dmg = 0
            let opp_total_dmg = 0

            user_target = set_target(user_char_arr, user_target)
            opp_target = set_target(opp_char_arr, opp_target)

            if(user_turn_dmgs.reduce((x,y) => x+y) >= opp_target.health + opp_hp){
                opp_target.get_wrecked()
                opp_hp += opp_target.health
            }
            if(opp_turn_dmgs.reduce((x,y) => x+y) >= user_target.health + user_hp){
                user_target.get_wrecked()
                user_hp += user_target.health
            }

            for(let char of user_char_arr){
                user_total_dmg += char.get_damage()
            }
            for(let char of opp_char_arr){
                opp_total_dmg += char.get_damage()
            }
            user_turn_dmgs[i] = user_total_dmg
            opp_turn_dmgs[i] = opp_total_dmg
        }

        let turn_dmgs = {
            "opp": opp_turn_dmgs,
            "user": user_turn_dmgs
        }

        return turn_dmgs
    }


    function set_target(char_arr, target){
        for(let i=0;i<char_arr.length;i++){
            if(Object.keys(target).length == 0 && priority_set){
                target = char_arr[i]
            } 
            if(!target.alive){
                if(char_arr[i].alive && char_arr[i].priority == parseInt(target.priority) + 1 && char_arr[i].priority > 0){
                    target = char_arr[i]
                }
            } else if(char_arr[i].alive && char_arr[i].priority < target.priority && char_arr[i].priority > 0){
                target = char_arr[i]
            }
        }
        return target
    }


// Returns object with character id as key and avg dmg per turn as value.
// Id is appended with letter to differentiate multiples 
    function format_data(char_arr){
        let formatted = []
        let dmg = 0

        // for(let i=0;i<char_arr.length;i++){
        //     dmg += parseFloat(char_arr[i].get_damage())
        // }
        for(let i=0;i<turns;i++){
            dmg += char_arr[i]
            formatted.push({ "x":i+1, "y":dmg })
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


    function generate_characters(player_div, char_arr){
        let char_wrap = document.querySelector(player_div)

        if(!char_wrap.firstChild) {
            for(let [i, char] of char_arr.entries()){
                let char_div = document.createElement("div")
                char_div.className = "character"
                char_div.id = "character" + i
                char_div.innerText = char.name
                char_wrap.appendChild(char_div)

                let char_toggle = document.createElement("input")
                char_toggle.className = "char_priority"
                char_toggle.id = "toggle" + i
                char_toggle.type = "number"
                char_toggle.min = "1"
                char_toggle.max = char_arr.length 
                char_div.appendChild(char_toggle)

                char_toggle.addEventListener("change", function() {
                    char_arr[this.id.slice(6,7)].assign_pri(this.value)
                    priority_set = true
                })
            }
        }
    }


}

