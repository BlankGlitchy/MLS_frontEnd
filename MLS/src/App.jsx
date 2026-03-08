import { useState } from 'react'
import './App.css'
import SHA256 from 'crypto-js/sha256'

const defaultUsers = [
  { username: 'alice', passwordHash: SHA256('password').toString() },
  { username: 'bob', passwordHash: SHA256('123456').toString() },
  { username: 'charlie', passwordHash: SHA256('qwerty').toString() },
]

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
//   const [password, setPassword] = useState('')
  const [currentUser, setCurrentUser] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    const users = window.appUsers || defaultUsers
    // const hashedPassword = SHA256(password).toString()
    // const user = users.find(u => u.username === username && u.passwordHash === hashedPassword)
    const user = users.find(u => u.username === username)
    if (user) {
      setCurrentUser(username)
      setIsLoggedIn(true)
      setError('')
    } else {
      setError('Invalid username or password')
    }
  }

  if (!isLoggedIn) {
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
          {/* <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /> */}
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    )
  }

  return <ChatApp currentUser={currentUser} />
}

function ChatApp({ currentUser }) {
  const [chats, setChats] = useState([
    { id: 1, type: 'user', name: 'Alice' },
    { id: 2, type: 'user', name: 'Bob' },
    { id: 3, type: 'group', name: 'Group1', owner: 'alice', members: ['alice'] },
    { id: 4, type: 'group', name: 'Group2', owner: 'bob', members: ['bob'] },
  ])

  // filter out chat with oneself
  const filteredChats = chats.filter(
    c => !(c.type === 'user' && c.name.toLowerCase() === currentUser.toLowerCase())
  )
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState({})
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState(window.appUsers || defaultUsers)
  const [bulkUserCount, setBulkUserCount] = useState('')
  const [bulkUserPrefix, setBulkUserPrefix] = useState('user')
  const [bulkDeletePrefix, setBulkDeletePrefix] = useState('')
  
  const bulkAddUsers = () => {
    const count = parseInt(bulkUserCount) || 0
    if (count <= 0) return
    
    const newUsers = []
    for (let i = 1; i <= count; i++) {
      newUsers.push({
        username: `${bulkUserPrefix}${i}`,
        // passwordHash: SHA256(`pass${i}`).toString(),
      })
    }
    const updatedUsers = [...users, ...newUsers]
    setUsers(updatedUsers)
    window.appUsers = updatedUsers
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
    window.appUsers = updatedUsers
    setBulkDeletePrefix('')
  }
  
  const addMember = (usernameToAdd) => {
    if (
      users.find(u => u.username === usernameToAdd) &&
      !selectedChat.members.includes(usernameToAdd)
    ) {
      setChats(prev =>
        prev.map(c =>
          c.id === selectedChat.id
            ? { ...c, members: [...c.members, usernameToAdd] }
            : c
        )
      )
      setSelectedChat(prev => ({ ...prev, members: [...prev.members, usernameToAdd] }))
    }
  }

  const kickMember = (usernameToRemove) => {
    setChats(prev =>
      prev.map(c =>
        c.id === selectedChat.id
          ? { ...c, members: c.members.filter(m => m !== usernameToRemove) }
          : c
      )
    )
    setSelectedChat(prev => ({
      ...prev,
      members: prev.members.filter(m => m !== usernameToRemove),
    }))
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
        <button className="logout-btn" onClick={() => window.location.reload()}>
          Log Out
        </button>
        <h3>Chats</h3>
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => setSelectedChat(chat)}
          >
            {chat.name} ({chat.type})
          </div>
        ))}
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
            {selectedChat.type === 'group' && (
              <div className="group-members">
                <h4>Members</h4>
                <ul>
                  {selectedChat.members.map((m, i) => (
                    <li key={i}>
                      {m}{' '}
                      {selectedChat.owner === currentUser && m.toLowerCase() !== currentUser.toLowerCase() && (
                        <button
                          className="kick-btn"
                          onClick={() => kickMember(m)}
                        >
                          Kick
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <h4>Add Users</h4>
                <ul className="available-users">
                  {users
                    .map(u => u.username)
                    .filter(u => !selectedChat.members.includes(u))
                    .map((u, idx) => (
                      <li key={idx}>
                        <button
                          className="add-user-btn"
                          onClick={() => addMember(u)}
                        >
                          {u}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
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