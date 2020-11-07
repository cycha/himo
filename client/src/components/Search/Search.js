import React from "react";
import ReactDOM from 'react-dom';
import {Button} from "antd";
import API from "../../utils/API";
import {SearchForm} from "./SearchForm";

export class Search extends React.Component {
    state = {
        isSearchControlDisplayed: true
    };

    search = (title, location) => {
        return API.search(title, location)
            .then(response => response.data)
            .then(ads => <AdList ads={ads}/>)
            .then(element => {
                // this.setState({isSearchControlDisplayed: false});
                ReactDOM.render(element, document.getElementById("result"));
            })
    };

    render() {
        return (
            <div className="Search">
                {/*<LoginButton/>*/}
                {this.state.isSearchControlDisplayed &&
                <SearchForm onSearchClick={this.search}/>
                }
                <div id="result"/>
            </div>
        );
    }
}

class AdList extends React.Component {

    render() {
        return (
            <dl>
                {this.props.ads.map((ad, index) =>
                    <dt key={index}>{ad.title}</dt>
                )}
            </dl>
        )
    }
}

class LoginButton extends React.Component {
    login = () => {
        window.location = "/login";
    };

    render() {
        return (
            <Button onClick={this.login} type="submit">
                Login
            </Button>
        )
    }

}