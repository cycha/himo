import React, {Component} from "react";
import "./App.css";
import 'antd/dist/antd.css';
import {Route, Switch} from "react-router-dom";
import {Dashboard} from "./components/Dashboard/Dashboard.js";
import {Login} from "./components/Login/Login.js";
import {Signup} from "./components/Signup/Signup.js";
import {PrivateRoute} from "./components/PrivateRoute.js";
import {Search} from "./components/Search/Search";
import {HomeOutlined} from "@ant-design/icons";

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <HomeOutlined /> <span style={{"paddingLeft": "1rem"}}>HIMO</span>
                </div>
                <div className="App-content">
                    <Switch>
                        <Route exact path="/" component={Search}/>
                        <Route exact path="/login" component={Login}/>
                        <Route exact path="/signup" component={Signup}/>
                        <PrivateRoute path="/dashboard" component={Dashboard}/>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default App;