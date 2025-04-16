import { Route, Switch } from "wouter";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/expenses" component={Expenses} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
