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
                ReactDOM.render(element, document.getElementById("results"));
            })
    };

    render() {
        return (
            <div className="Search">
                {/*<LoginButton/>*/}
                {this.state.isSearchControlDisplayed &&
                <SearchForm onSearchClick={this.search}/>
                }
                <div id="results"/>
            </div>
        );
    }
}

class AdList extends React.Component {

    render() {
        return (
            <dl>
                {this.props.ads.map((ad, index) =>
                    <a href={ad.url} rel="nofollow" target="_blank">
                        <dt key={index} className="AdItem">
                            <div>
                                <div>{ad.title}</div>
                                <div>{new Date(ad.release_date).toDateString()}</div>
                            </div>
                            <p className="price">{ad.price} €</p>
                        </dt>
                    </a>
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