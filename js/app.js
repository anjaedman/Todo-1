console.log("script app.js connected");

//Ett "Top level" objekt, ett globalt "App"-objekt
const baseUrl = "https://api.jsonbin.io/v3/b/"
const ourTodoUrl = baseUrl + "6396ec752d0e0021081aa488" ///fyll i din bin.id
const masterKey = "$2b$10$bvAQKClK8f6yd5wv.F4OheYPjb/ysVo4K0auyit7YcfCjmI.Y6NA6"

console.log("BaseUrl:", baseUrl)
console.log("OurTodos:", ourTodoUrl)
console.log("MasterKey:", masterKey)

const App = {
    listOfTodos: [], //vår lista av todos skall in här
    elements: {
        // våra"main" element vi ska arbeta mot stoppar vi in här
        container: document.getElementById("todo-container")
    },
    addInitialTodos: function () { // vi skapar upp 3 initials Todos som ska renderas vid start
        // this.listOfTodos.push(
        //     createTodoItem("köket", "diska vår disk för hand", Date.now() + 1),
        //     createTodoItem("Vardagsrum", "Städa under soffan(dammigt)", Date.now() + 2),
        //     createTodoItem("Handla", "glömde köpa ost på burk, till våra tacos", Date.now() + 3),
        // )

    },
    fetchTodos: function () {
        // fetch, inbygg funktion för att hämta en url
        fetch(ourTodoUrl, {
            headers: {
                "x-Master-key": masterKey, //våran auth/ identifiering mot databasen(om privat)
            }
        })
            .then(function (response) {
                return response.json()
            })
            .then((response) => {
                let data = response; // data variabel sätts till response

                console.log("Data:", data.record) //loggar vår data.record som är en Array av våra items

                this.listOfTodos = [] //denna rensar

                data.record.forEach((obj) => { // loopar igenom våra items i data.record arrayen
                    this.listOfTodos.push(obj) // lägger till dessa i vår App.listOfTodos
                });
                this.render(); //kallar på vår render-funktion för att "måla upp" vyerna

            })
            .catch(function (err) {
                console.log("Error: " + err)
            })

    },
    // uppdatera den här: create: function( => skicka upp vårtnyligen skapade item)
    create: function () { // våran function för att skapa en todo
        const inputTitle = document.querySelector("input[name='todo-title']")
        const inputText = document.querySelector("input[name='todo-text']")
        const inputColor = document.querySelector("input[name='todo-color']")




        //skickar värdena till funktion addTodoItem
        //värderna kommer från våra inputs, hämtas via element, value
        // addTodoItem(inputTitle.value, inputText.value)

        const newItem = createTodoItem(inputTitle.value, inputText.value, inputColor.value)
        this.listOfTodos.push(newItem)

        fetch(ourTodoUrl, {
            method: "PUT", // "putta upp"
            headers: {
                "X-Master-Key": masterKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.listOfTodos)
        })
            .then(function (response) {
                return response.json();
            })
            .then((response) => {

                let data = response;
                console.log(data)

                this.fetchTodos()

            })
            .catch(function (err) {
                console.log("Error: " + err)
            })

    },
    //uppdatera den här remove:function( =>)

    update: function (id) { //våran function för att uppdatera vår todo
        let findItemIndex = this.listOfTodos.findIndex(item => item.id == id)
        this.listOfTodos[findItemIndex].checked = !this.listOfTodos[findItemIndex].checked

        this.render()
    },
    remove: function (id) { // våran function för att ta bort vår todo

        let findItemIndex = this.listOfTodos.findIndex(item => item.id === id)
        //ta bort det indItemIndex vi ittar från vår array
        this.listOfTodos.splice(findItemIndex, 1);

        //skicka vår nya lista till servern
        fetch(ourTodoUrl, {
            method: "PUT",
            headers: {
                "X-Master-Key": masterKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.listOfTodos)
        })
            .then(function (response) {
                return response.json();
            })
            .then((response) => {

                let data = response;
                console.log(data)

                this.fetchTodos()

            })
            .catch(function (err) {
                console.log("Error: " + err)
            })

    },
    render: function () {

        this.elements.container.innerHTML = '' // vi tömmer våran nuvarande "container"
        resetForm()
        this.listOfTodos.forEach((item) => {


            const newTodoItem = document.createElement("div")
            const newTodoTitle = document.createElement("h2")
            const newTodoDate = document.createElement("span")
            const newTodoText = document.createElement("p")
            const newBtnRemove = document.createElement("button")
            const newBtnCheck = document.createElement("button")
            const newBtnRemoveIcon = document.createElement("img")

            const buttonContainer = document.createElement("section")
            const newBtnCheckIcon = document.createElement("img")

            // const newBtnRemoveId = item.id
            // console.log(newBtnRemoveId)

            newTodoTitle.innerText = item.title

            // newTodoDate.innerText = `${item.id}`
            newTodoDate.innerText = new Date(item.id).toLocaleDateString()

            newTodoText.innerText = item.text
            newBtnRemoveIcon.src = "../assets/recycle.png"
            newBtnCheck.innerText = item.checked ? "Done" : "Mark Done"

            newBtnCheckIcon.src = "../assets/check.png"
            newBtnCheck.appendChild(newBtnCheckIcon)

            newBtnRemove.appendChild(newBtnRemoveIcon)

          
            const determineCardColor = `card-color-${item.colorIndex}`
            //class = "todo-item card-color-randomNummer(1-3)"

            newTodoItem.classList.add("todo-item", determineCardColor)
            newBtnRemove.classList.add("btn-remove-todo")
            item.checked ? newTodoItem.classList.add("todo-checked") : null

            // Till mediquerius
            newTodoDate.classList.add("todo__date")


            newBtnRemove.addEventListener("click", function () {
                console.log('onClick  = Remove todo item')
                App.remove(item.id);
            })

            newBtnCheck.addEventListener("click", function () {
                App.update(item.id)
            })


            buttonContainer.append(newBtnCheck, newBtnRemove)

            newTodoItem.append(
                newTodoTitle,
                newTodoDate,
                newTodoText,

                buttonContainer
                // newBtnCheck, 
                // newBtnRemove

            )

            this.elements.container.appendChild(newTodoItem)

        })
    }
}

function createTodoItem(suppliedTitle, suppliedText, suppliedColor, suppliedId) {

    //slumpvis siffra mellan 1-3 
    // const ranColIndex = Math.floor(Math.random() * 3 + 1)

    // elvis-operator ?: värde/vilkor ? true : false
    return {
        id: suppliedId ? suppliedId : Date.now(),
        title: suppliedTitle,
        text: suppliedText,
        colorIndex: suppliedColor,
        checked: false
    }
}

//denn funktion körs av input= "submit", skickar iväg form
function onFormSubmit() {
    App.create()
}

function resetForm() {
    document.querySelector("input[name='todo-title']").value = ""
    document.querySelector("input[name='todo-text']").value = ""
}

// App.addInitialTodos()
App.fetchTodos()
App.render()

function logApp() {
    console.log(App)
    console.table(App.listOfTodos)
}
