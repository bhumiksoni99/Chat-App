const users = []

const addUser = ({ id, username, room}) =>{
    
    //Clean The data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate
    if(!username || !room)
    {
        return{
            error:'Username and Room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser)
    {
        return {
            error:'Username is already in use!'
        }
    }

    //save user
    const user = { id , username , room}
    users.push(user)
    return { user }
}

const removeUser = (id) =>{
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index!== -1)
    {
        return users.splice(index,1)[0]
    }
}

const getUser = (id) =>{
    const theUser = users.find((user) => {
        return user.id === id 
    })
    return theUser
}

const getUsersinRoom = (room) => {
    const allUsers = users.filter((user) => {
        return user.room === room
    })
    return allUsers
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersinRoom
}