
window.addEventListener('load', () => {
    fetch('/profile').then((res) => res.json()).then(({ token }) => Cookies.set('hackInCariri@token', token, { secure: true, sameSite: 'strict' }))
})

function getPayload() {
    const formInputsElement = document.querySelectorAll('#form-4ecc3379813de4eef337a03a3c828b6b input')

    const data = {}

    formInputsElement.forEach((input) => { 
        data[input.name] = input.value
    })

    return data
}
function _submit(event) {
    event.preventDefault();

    const data = getPayload()

    fetch('/send-flag', {
        body: JSON.stringify(data),
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${Cookies.get('hackInCariri@token')}`
        }
    })
        .then((res) => res.json())
        .then(({ data }) => {
            if (data.flag) {
                alert(`sua flag: ${data.flag}`)
                return
            }
            alert(data)
        }).catch(({ data }) => {
            alert(data)
        })
}

window.document.querySelector('button[type=submit]').addEventListener('click', () => {
    const data = getPayload()
    delete data.token
    delete data.flag

    if(validator.isEmail(data.email) === false || Boolean(data.password) === false){
        return
    }

    fetch('/crawler', {
        body: JSON.stringify(data),
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${Cookies.get('hackInCariri@token')}`
        }
    }).catch(({ data }) => {
        alert(data)
    })
})


