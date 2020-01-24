import React from 'react'
import { Switch, Route, BrowserRouter as Router, Redirect } from 'react-router-dom'
import { Flex, Box } from 'rimble-ui'

import Activity from '../views/Activity/Activity'
import Explore from '../views/Explore/Explore'
import IdentityManager from '../views/Identity/IdentitiyManager'
import IdentityDetail from '../views/Identity/IdentityDetail'
import Request from '../views/Request/Request'
import Connections from '../views/Connections/Connections'
import Issue from '../views/Issue/Issue'

import Sidebar from './Sidebar'
import SidePanel from './SidePanel'
import NavigationLeft from './NavigationLeft'
import Credential from '../components/Credential/Credential'

import * as queries from '../queries'

interface DashboardProps {}

const renderCredentialQuery = (props: any) => {
  console.log(props)
  return <Credential detailMode {...props} />
}

const Dashboard: React.FC<DashboardProps> = () => {
  return (
    <Router>
      <Flex flexDirection={'row'} flex={1}>
        <Sidebar />
        <NavigationLeft />
        <Box flex={1} bg="#1C1C1C">
          <Switch>
            <Route exact path="/">
              <Redirect to="/activity" />
            </Route>
            <Route path="/activity">
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
          <Route path="/identities/user/:id">
            <SidePanel title={'Identity'} closeUrl={'/identities'}>
              <IdentityDetail />
            </SidePanel>
          </Route>
          <Route path="/activity/credential/:id">
            <SidePanel
              title={'Credential'}
              closeUrl={'/activity'}
              query={queries.credential}
              renderQuery={renderCredentialQuery}
            ></SidePanel>
          </Route>
        </Switch>
      </Flex>
    </Router>
  )
}

export default Dashboard
