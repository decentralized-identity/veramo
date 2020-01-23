import React from 'react'
import { Box, Text, Heading } from 'rimble-ui'
import { NavLink } from 'react-router-dom'

const Component = () => {
  return (
    <Box p={3} width={220} bg="#28292B" borderRight={1} borderColor={'#4B4B4B'}>
      <Box mb={32} pt={2}>
        <Heading as={'h3'}>Daf Dashboard</Heading>
        {/* <Text>DID management and credential portal</Text> */}
      </Box>
      <ul className={'left-nav-list'}>
        <li className={'left-nav-item'}>
          <NavLink exact to="/">
            Activity
          </NavLink>
        </li>
        <li className={'left-nav-item'}>
          <NavLink to="/explore">Explore</NavLink>
        </li>
        <li className={'left-nav-item'}>
          <NavLink to="/issue">Issue Credential</NavLink>
        </li>
        <li className={'left-nav-item'}>
          <NavLink to="/request">Request</NavLink>
        </li>
        <li className={'left-nav-item'}>
          <NavLink to="/identities">Identities</NavLink>
        </li>
        <li className={'left-nav-item'}>
          <NavLink to="/connections">Connections</NavLink>
        </li>
      </ul>
    </Box>
  )
}

export default Component
