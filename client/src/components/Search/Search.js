import React from "react";
import ReactDOM from 'react-dom';
import {Button} from "antd";
import API from "../../utils/API";
import {SearchForm} from "./SearchForm";

export class Search extends React.Component {
    state = {
        isSearchControlDisplayed: true
    };

    search = (params) => {
        return API.search(params)
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
                        <dt key={index} className="AdItemContainer">
                            <img src={ad.thumb_url} className="AdItemImage"/>
                            <div className="AdItemTextContainer">
                                <h4>{ad.title}</h4>
                                <div>{ad.location.city} {ad.location.zipcode}</div>
                                <div>{new Date(ad.release_date).toLocaleDateString()}</div>
                                {ad.surface &&
                                <p>{ad.surface} m²</p>
                                }
                            </div>
                            <h3 className="price">{ad.price} €</h3>
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