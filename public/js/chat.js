const socket = io()
const $forminput = document.querySelector('input')
const $formbutton = document.querySelector('#send')
const $locationbutton = document.querySelector('#sendLocation')
const $message = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')
//msg template
const msgTemplate = document.querySelector('#msg-template').innerHTML
//location template
const LocTemplate = document.querySelector('#Forlocation').innerHTML
//sidebar template
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username , room} = Qs.parse(location.search ,{ ignoreQueryPrefix : true})

const autoscroll = () =>{

 
       //New message element
       const $newMessage = $message.lastElementChild

       //height of new msg
       const newMessageStyles = getComputedStyle($newMessage)
       const newMessageMargin = parseInt(newMessageStyles.marginBottom)
       const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
   
       //visible height
       const visibleHeight = $message.offsetHeight
   
       //container height
       const containerHeight = $message.scrollHeight
       
       //How far i have scrolled
       const scrolloffSet = $message.scrollTop + visibleHeight
       //.scroll gives us as a number the distance we have scrolled from the top
   
       if(containerHeight - newMessageHeight <= scrolloffSet){
        $message.scrollTop = $message.scrollHeight
         }

        //or following code can be used to scroll
        //const element=$message.lastElementChild
        //element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
        
        
    
}


socket.on('print' , (msg) =>{
    console.log(msg)
    const html = Mustache.render( msgTemplate , {
        name:msg.username,
        msg:msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend' , html)
    autoscroll()
    
})

socket.on('locationPrint' , (locationMsg) =>{
    console.log(locationMsg)
    const html = Mustache.render(LocTemplate , {
        name:locationMsg.username,
        url:locationMsg.url,
        createdAt:moment(locationMsg.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend' , html)
    autoscroll()
 
})

socket.on('roomData' , (data) =>{
    const html = Mustache.render(sidebarTemplate , {
        room:data.room,
        users: data.users
    })
    $sidebar.innerHTML = html
})


const form = document.querySelector('form')
form.addEventListener('submit' , (event) => {
    event.preventDefault()

    //disable send button
    $formbutton.setAttribute('disabled','disabled')
    const message = document.getElementById('message').value

    socket.emit('sendMessage' , message ,(error)=> {
        if(error)
        {
            return console.log(error)
        }
        console.log('Message Delivered!')
        //enable after first msg is sent
        $formbutton.removeAttribute('disabled')
        $forminput.value = ''
        $forminput.focus()
    })
})

const loc = document.querySelector('#sendLocation')
loc.addEventListener('click' , () => {

    if(!navigator.geolocation){
        return alert('The browser does not support the requested command')
    }

    $locationbutton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit('sendLocation' , {
            lat:position.coords.latitude,
            long:position.coords.longitude
        } , ()=>{
            console.log('Location Sent!')
            $locationbutton.removeAttribute('disabled')
        })
    })
})

socket.emit('join' ,{ username , room} , (error) => {
    if(error)
    {
        alert(error)
        location.href = '/' 
    }
})