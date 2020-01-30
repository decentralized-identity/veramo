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
import RequestDetail from '../components/Request/Request'

import * as queries from '../gql/queries'

interface DashboardProps {}

const renderCredentialQuery = (props: any) => {
  return <Credential detailMode {...props?.credential} />
}

const renderSDRQuery = (props: any, close: () => void) => {
  return <RequestDetail {...props?.message} close={close} />
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

        {/* 
          The SidePanel component is a query wrapper that can query for any detail item based on the :id param. 
          If renderQuery prop is not passed in then it will ignore and just show the children.
          The use case is if you need to have reusable components and not have embbeded GQL queries inside. 
          ie all components in the components directory should be reusable
        */}

        <Switch>
          <Route path="/identities/user/:id">
            <SidePanel title={'Identity'} closeUrl={'/identities'}>
              <IdentityDetail />
            </SidePanel>
          </Route>
          <Route
            exact
            path="/activity/credential/:id"
            component={() => (
              <SidePanel
                title={'Credential'}
                closeUrl={'/activity'}
                query={queries.credential}
                renderQuery={renderCredentialQuery}
              ></SidePanel>
            )}
          ></Route>
          <Route
            exact
            path="/activity/sdr/:id"
            component={() => (
              <SidePanel
                title={'Selective Disclosure'}
                closeUrl={'/activity'}
                query={queries.queryMessage}
                renderQuery={renderSDRQuery}
              ></SidePanel>
            )}
          ></Route>
        </Switch>
      </Flex>
    </Router>
  )
}

export default Dashboard
