import React, { useEffect, useState } from 'react'
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
  
  const body = new FormData()
  body.append('username', username)
  body.append('password', password)
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      body: body,
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
            placeholder="Password"
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

  const bulkAddUsers = async () => {
    const count = parseInt(bulkUserCount)
    try {
      const res = await fetch(`${API_URL}/bulk_add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          count: count,
          prefix: bulkUserPrefix
        })
      })

      const data = await res.json()

      if (res.ok) {
        console.log("Bulk add successful:", data)
      }

      setBulkUserCount('')
      setBulkUserPrefix('user')

    } catch (err) {
      console.error("Bulk add failed:", err)
    }
  }

  const bulkDeleteUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/bulk_delete?prefix=${bulkUserPrefix}`, {
      method: "DELETE"
    })

    const data = await res.json()

    if (res.ok) {
      console.log("Bulk delete successful:", data)

      setUsers(users.filter(u => !u.username.startsWith(bulkDeletePrefix)))

      setBulkUserPrefix('user')
    }

  } catch (err) {
    console.error("Bulk delete failed:", err)
  }
}

  /* Main chat app UI */
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
        <h3>Users</h3>
{users.map((u) => (
  <div
    key={u.username}
    className="chat-item"
    onClick={() =>
      setSelectedChat({
        id: u.username,
        name: u.username,
        members: [currentUser, u.username],
      })
    }
  >
    {u.username}
  </div>
))}
{/* Show selected chat at top of sidebar */}
        {selectedChat && (
          <div className="chat-item active">
            {selectedChat.name}
          </div>
        )}
        {/* Bulk user management section */}
        <div className="bulk-user-management">
        <h3>Bulk User Creation</h3>
        <input
          type="number"
          placeholder="Number of users"
          value={bulkUserCount}
          onChange={(e) => setBulkUserCount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username prefix"
          value={bulkUserPrefix}
          onChange={(e) => setBulkUserPrefix(e.target.value)}
        />
        <button onClick={bulkAddUsers}>Create Users</button>
        <button onClick={bulkDeleteUsers}>Delete Users</button>
      </div>
      </div>

{/* Chat area */}
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
          </>
        ) : (
          <p>Select a chat to start messaging</p>
        )}
      </div>
    </div>
  )
}  
export default App