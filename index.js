

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
    process_data(user_deck_id, true)
    process_data(opp_deck_id, false)
    get_curve(4)
})


function process_data(deck_id, user){
    let url = base_url + "decklist/" + deck_id
    axios
        .get(url, {"Access-Control-Allow-Origin": "*"})
        .then(function(response) {
            let data = response.data
            if(user){
                user_char = data["characters"]
                user_deck_cards = data["slots"]
                var cards = Object.assign({}, user_char, user_deck_cards)
            } else {
                opp_char = data["characters"]
                opp_deck_cards = data["slots"]
                var cards = Object.assign({}, opp_char, opp_deck_cards)
            }
            
            let card_promises = []

            Object.keys(cards).forEach(function(card){
                card_promises.push(get_card_data(card))
            })
            axios
                .all(card_promises)
                .then(axios.spread((...args) => {
                    for(let card_obj of args){
                        card_data[card_obj["data"]["code"]] = card_obj["data"]
                    }
                    assign_values()
                }))
        })
}

function assign_values(){
    console.log(card_data)
    for(let char_id of Object.keys(opp_char)){
        console.log(char_id)
    }
    for(let char_id of Object.keys(user_char)){
        console.log(char_id)
    }
}


function get_card_data(card){
    let url = base_url + "card/" + card
    return axios.get(url, {"Access-Control-Allow-Origin": "*"})
}


function get_curve(turns){
    let margin = {top: 10, right: 30,  bottom: 30, left: 60}
    let width = 460 - margin.left - margin.right
    let height = 400 - margin.top - margin.bottom

    let svg = d3.select(".chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
    let data = [{x:1, y:2}, {x:2, y:4}, {x:3, y:6}, {x:4, y:8}] 
    let x = d3.scaleLinear().range([0, width])
    let y = d3.scaleLinear().range([height, 0])

    x.domain([1,turns])
    y.domain([0,d3.max([10])])

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(turns))
        
    svg.append("g")
        .call(d3.axisLeft(y))

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "#69b3a2")
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
            .attr("fill", "#69b3a2")
}

