import './App.css'
import { useState } from 'react'
import { USER_ROLES, type UserRole } from '@srgdj/shared'

import { Button } from './components/ui/button'

function App() {
  const [role, setRole] = useState<UserRole>(USER_ROLES.USER)
  const handleClick = () => {
    setRole(
      USER_ROLES[role as keyof typeof USER_ROLES] === USER_ROLES.USER
        ? USER_ROLES.MANAGER
        : USER_ROLES.USER,
    )
    setRole(
      USER_ROLES[role as keyof typeof USER_ROLES] === USER_ROLES.MANAGER
        ? USER_ROLES.ADMIN
        : USER_ROLES.MANAGER,
    )
    setRole(
      USER_ROLES[role as keyof typeof USER_ROLES] === USER_ROLES.ADMIN
        ? USER_ROLES.USER
        : USER_ROLES.ADMIN,
    )
  }
  return (
    <div>
      <h1>SRGDJ</h1>
      <Button onClick={handleClick}>view next role</Button>
      {/* <button onClick={handleClick}>view next role</button> */}

      <p>{role}</p>
    </div>
  )
}

export default App
