const listElement = document.getElementById('list')
const createBTN = document.getElementById('create')
const formEl = document.getElementById('formApp')
const inpNameElement = document.getElementById('name')
const inpValElement = document.getElementById('value')
var posts = []
var loading = false

function render(){
    listElement.innerHTML = ''
    for (let i = 0; i < posts.length; i++) {
        listElement.insertAdjacentHTML('beforeend', getPostHTML(posts[i], i))
    }
}
formEl.addEventListener('submit', async function (e){
    if (inpNameElement.value && inpValElement.value){
        //let newObj = {name: inpNameElement.value, value: inpValElement.value, id: Date.now(), marked: false}
        let {...contact} = {name: inpNameElement.value, value: inpValElement.value}

        const newCont = await request('/api/contacts', 'POST', contact)
        posts.push(newCont)
        render()
        inpValElement.value = inpNameElement.value = ''
        console.log(posts)
        e.preventDefault()
    }
})
listElement.onclick = async (event) => {
    if (event.target.dataset.index){
        const index = event.target.dataset.index
        const type = event.target.dataset.type
        if (type === 'toggle'){
            let contact = posts.find(c => c.id === posts[index].id)
            let newMark = !posts[index].marked
            let update = await request(`/api/contacts/${posts[index].id}`, 'PUT', {
                ...contact,
                marked: newMark
            })
            posts[index].marked = update.marked
            render()
        }
        else if (type === 'remove'){
            await request(`/api/contacts/${posts[index].id}`, 'DELETE')
            posts.splice(index, 1)
            render()
        }
    }
}
function getLoaderComponent() {
    return  `
       <div style="display: flex; justify-content: center; align-items: center">
           <div class="spinner-border" role="status">
                <span class="sr-only"></span>
            </div>
        </div> 
    `
}
function getPostHTML(posts, ind){
    return `
        <div class="card mb-3">
        <div class="card-body">
            <h5 
            id="title-card"
            class="card-title"
            style="${posts.marked ? 'background: red' : 'background: teal'}; color: white"
            >${posts.name}</h5>
            <p class="card-text">${posts.value}</p>
            <button 
            data-index="${ind}"
            data-type="toggle"  
            class="btn btn-primary"
            >Отметить</button>
            <button 
            data-index="${ind}"
            data-type="remove"
            class="btn btn-danger"
            >Удалить</button>
        </div>
    </div>
`
}
async function request(url, method = 'GET', data = null) {
    try {
        const headers = {}
        let body
        if (data) {
            headers['Content-type'] = 'application/json'
            body = JSON.stringify(data)
        }
        const response = await fetch(url, {
            method, //GET
            headers,
            body
        })
        return await response.json()
    } catch (e) {
        console.warn('Error ', e.message)
    }
}
(async function (){
    loading = true
    listElement.innerHTML = getLoaderComponent()
    const data = await request('/api/contacts')
    posts = data
    loading = false
    render()
}())