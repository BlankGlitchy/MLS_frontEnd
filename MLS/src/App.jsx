import { useState } from 'react'
import './App.css'


const API_URL = 'http://localhost:8000'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [currentUser, setCurrentUser] = useState('')
  const [error, setError] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState({})
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState([])
  const [bulkUserCount, setBulkUserCount] = useState('')
  const [bulkUserPrefix, setBulkUserPrefix] = useState('user')
  const [bulkDeletePrefix, setBulkDeletePrefix] = useState('')
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [showRegister, setShowRegister] = useState(false)

  const handleRegister = async(e) => {
    e.preventDefault()
  
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({username: registerUsername, password: registerPassword}),
      })
      const data = await response.json()
      if (response.ok) {
        setShowRegister(false)
        setError('')
        console.log('Registration successful')
      } else {
        setRegisterError(data.detail || 'Registration failed')
      }
    } catch (error) {
      setRegisterError('An error occurred during registration')
      console.error('Registration error:', error)
    }
  }

  const handleLogin = async(e) => {
  e.preventDefault()
  
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      body: formData,
    })
    const data = await response.json()
    if (response.ok) {
      localStorage.setItem('access_token', data.access_token)
      setCurrentUser(username)
      setIsLoggedIn(true)
      setError('')
      console.log('Login successful')
    } else {
      setError(data.detail || 'Login failed')
    }
  } catch (error) {
    setError('An error occurred during login')
    console.error('Login error:', error)
  }
}

  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <div className="login">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Username"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
            />
            <input
              type="password"
              maxLength={12}
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <button type="submit">Register</button>
            {registerError && <p className="error">{registerError}</p>}
            <button type="button" onClick={() => setShowRegister(false)}>
              Back to Login
            </button>
          </form>
        </div>
      )
    }

    return (
      <div className="login">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
          <button type="button" onClick={() => setShowRegister(true)}>
            Register
          </button>
        </form>
      </div>
    )
  }

  const bulkAddUsers = () => {
    const count = parseInt(bulkUserCount) || 0
    if (count <= 0) return
    
    const newUsers = []
    for (let i = 1; i <= count; i++) {
      newUsers.push({
        username: `${bulkUserPrefix}${i}`,
        password: `${bulkUserPrefix}${i}`,
      })
    }
    const updatedUsers = [...users, ...newUsers]
    setUsers(updatedUsers)
    setNewMessage('')
    setBulkUserCount('')
    setBulkUserPrefix('user')
  }
  
  const bulkDeleteUsers = () => {
    if (!bulkDeletePrefix.trim()) return
    
    const updatedUsers = users.filter(
      u => !u.username.includes(bulkDeletePrefix.toLowerCase())
    )
    setUsers(updatedUsers)
    setBulkDeletePrefix('')
  }
  
  const addMember = (usernameToAdd) => {
    if (users.find(u => u.username === usernameToAdd) && selectedChat && !selectedChat.members.includes(usernameToAdd)) {
      setSelectedChat(prev => ({ ...prev, members: [...prev.members, usernameToAdd] }))
    }
  }

  const kickMember = (usernameToRemove) => {
    if (selectedChat) {
      setSelectedChat(prev => ({
        ...prev,
        members: prev.members.filter(m => m !== usernameToRemove),
      }))
    }
  }

  const sendMessage = () => {
    if (
      newMessage.trim() &&
      selectedChat &&
      !(selectedChat.type === 'user' && selectedChat.name.toLowerCase() === currentUser.toLowerCase())
    ) {
      const chatId = selectedChat.id
      const msg = { text: newMessage, sender: currentUser, timestamp: new Date() }
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), msg]
      }))
      setNewMessage('')
    }
  }

  return (
    <div className="chat-app">
      <div className="sidebar">
        <h3>Logged in as: {currentUser}</h3>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('access_token')
          setIsLoggedIn(false)
          setCurrentUser('')
        }}>
          Log Out
        </button>
        <h3>Chats</h3>
        {selectedChat && (
          <div
            className="chat-item active"
            onClick={() => setSelectedChat(selectedChat)}
          >
            {selectedChat.name}
          </div>
        )}
      </div>
      <div className="chat-area">
        {selectedChat ? (
          <>
            <h3>{selectedChat.name}</h3>
            <div className="messages">
              {(messages[selectedChat.id] || []).map((msg, idx) => (
                <div key={idx} className="message">
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
              {newMessage.toLowerCase().trim() === 'test' && (
                <div className="bulk-add-container">
                  <div className="bulk-section">
                    <h5>Create Users</h5>
                    <input
                      type="number"
                      min="1"
                      placeholder="Number of users"
                      value={bulkUserCount}
                      onChange={(e) => setBulkUserCount(e.target.value)}
                      className="bulk-input"
                    />
                    <input
                      type="text"
                      placeholder="Username prefix (e.g. 'user')"
                      value={bulkUserPrefix}
                      onChange={(e) => setBulkUserPrefix(e.target.value)}
                      className="bulk-input"
                    />
                    <button className="bulk-add-btn" onClick={bulkAddUsers}>
                      Create Users
                    </button>
                  </div>
                  <div className="bulk-section">
                    <h5>Delete Users</h5>
                    <input
                      type="text"
                      placeholder="Username/prefix to delete"
                      value={bulkDeletePrefix}
                      onChange={(e) => setBulkDeletePrefix(e.target.value)}
                      className="bulk-input"
                    />
                    <button className="bulk-delete-btn" onClick={bulkDeleteUsers}>
                      Delete Users
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p>Select a chat to start messaging</p>
        )}
      </div>
    </div>
  )
}

export default App