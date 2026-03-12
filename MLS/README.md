## Features

- Login screen with username and password validation (passwords are hashed) 
   - At the moment using a dummy DB
- Sidebar with list of contacts and groups
   - 3 hardcoded users in a dummy DB - Can add dummy users
- Chat interface for sending and receiving messages 
   - Doesn't save the messages
- Group chats support adding members by clicking on their username
   - Makes it easier to bulk add to test MLS implementation
- Sidebar is showing logged-in username with a logout button underneath 
- Group chats allow kicking other users 
   -only the group owner can kick
- To create dummy users: type test in any textfield while logged in, then a boxe apear. One to set number of users and for naming and one to bulk delete dummy users. 

## Test Accounts (Hardcoded)

- Username: alice, Password: password
- Username: bob, Password: 123456
- Username: charlie, Password: qwerty

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open http://localhost:5173 in your browser.

## Usage

- Enter any username and password from the mock DB (See test accounts)
- Select a chat from the sidebar
- Type a message and press Enter or click Send (mesages are not saved)

Note: This is a frontend-only app with mock data. Messages are stored in local state and will be lost on refresh at the moment.

/*<div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>

              {newMessage.toLowerCase().trim() === 'test' && (
            
              )}*/