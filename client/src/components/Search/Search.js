import React from "react";
import { Button } from "react-bootstrap";

export class Search extends React.Component {
    login = () => {
        window.location = "/login";
    };
    render() {
        return (
            <div className="Search">
                <h1>HIMO</h1>
                <Button onClick={this.login} block bsSize="large" type="submit">
                    Login
                </Button>
            </div>
        );
    }
}