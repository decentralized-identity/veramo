import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { Flex, Box, Text, Heading, Button, Icon, Table, Field, Input } from 'rimble-ui'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'

import Activity from '../views/Activity/Activity'
import Explore from '../views/Explore/Explore'
import IdentityManager from '../views/Identity/IdentitiyManager'
import IdentityDetail from '../views/Identity/IdentityDetail'
import Request from '../views/Request/Request'
import Connections from '../views/Connections/Connections'
import Issue from '../views/Issue/Issue'

import Sidebar from './Sidebar'
import NavigationLeft from './NavigationLeft'

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [sidePanelOpen, toggleSidePanel] = useState(true)

  return (
    <Router>
      <Flex flexDirection={'row'} flex={1}>
        <Sidebar />
        <NavigationLeft />
        <Box flex={1} bg="#1C1C1C">
          <Switch>
            <Route exact path="/">
              <Activity />
            </Route>
            <Route path="/explore">
              <Explore />
            </Route>
            <Route path="/issue">
              <Issue />
            </Route>
            <Route path="/request">
              <Request />
            </Route>
            <Route path="/identities">
              <IdentityManager />
            </Route>
            <Route path="/connections">
              <Connections />
            </Route>
          </Switch>
        </Box>

        <Switch>
          <Route path="/identities/:id">
            <IdentityDetail />
          </Route>
        </Switch>
      </Flex>
    </Router>
  )
}

export default Dashboard
