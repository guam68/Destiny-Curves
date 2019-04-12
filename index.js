

let base_url = "https://swdestinydb.com/api/public/"
let test = document.querySelector(".test")        
let deck_submit_btn = document.querySelector("#deck_submit_btn") 
let user_deck_id = document.querySelector("#user_deck_id").value
let opp_deck_id = document.querySelector("#opp_deck_id").value
let user_char = []
let user_deck_cards = []
let opp_char = []
let opp_deck_cards = []
let card_data = {}

deck_submit_btn.addEventListener("click", () => {
    process_data(user_deck_id, opp_deck_id)
})


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
                    get_curve(4)
                }))
        })
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
    y.domain([0,d3.max([20])])

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(turns))
        
    svg.append("g")
        .call(d3.axisLeft(y))

    let data = [{x:1, y:2}, {x:2, y:4}, {x:3, y:6}, {x:4, y:8}] 
    let opp_dmg = calc_dmg(opp_char)
    let user_dmg = calc_dmg(user_char)
    data_to_curve(opp_dmg, "#a33639")
    data_to_curve(user_dmg, "#0071C5")

    


// Returns object with character id as key and avg dmg per turn as value.
// Id is appended with letter to differentiate multiples 
    function calc_dmg(chars){
        let avg_dmgs = {}
        let dupe = "abcde"
        console.log(opp_char)
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
        return format_data(avg_dmgs)
    }


    function format_data(damages){
        let formatted = []
        let dmg = 0

        for(let key in damages){
            dmg += damages[key]
        }
        for(let i=0;i<turns;i++){
            formatted.push({ "x":i+1, "y":dmg * (i+1) })
        }
        console.log(formatted)
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
}

