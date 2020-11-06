import React from "react";
import ReactDOM from 'react-dom';
import {Button, FormControl, FormGroup, FormLabel} from "react-bootstrap";
import API from "../../utils/API";

export class Search extends React.Component {
    state = {
        title: "",
        location: ""
    };
    login = () => {
        window.location = "/login";
    };

    search = () => {
        const {title, location} = this.state;
        return API.search(title, location)
            .then(response => response.data)
            .then(ads =>
                <div>
                    {ads.map(ad =>
                        <p>{ad.title}</p>
                    )}
                </div>
            )
            .then(element => {
                ReactDOM.render(element, document.getElementById("result"))
            })
    };
    handleChange = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    };

    render() {
        const {title, location} = this.state;
        return (
            <div className="Search">
                <h1>HIMO</h1>
                <Button onClick={this.login} block bsSize="large" type="submit">
                    Login
                </Button>
                <div>
                    <h1>Search</h1>
                    <FormGroup controlId="title" bsSize="large">
                        <FormLabel>Subject</FormLabel>
                        <FormControl
                            autoFocus
                            type="text"
                            value={title}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup controlId="location" bsSize="large">
                        <FormLabel>Location</FormLabel>
                        <FormControl
                            value={location}
                            onChange={this.handleChange}
                            type="text"
                        />
                    </FormGroup>
                    <Button onClick={this.search} block bsSize="large" type="submit">
                        Search
                    </Button>
                </div>
                <div id="result"/>
            </div>
        );
    }
}