import React from "react";
import ReactDOM from 'react-dom';
import {Button, BackTop} from "antd";
import API from "../../utils/API";
import {SearchForm} from "./SearchForm";

export class Search extends React.Component {
    state = {
        isSearchControlDisplayed: true
    };

    search = (body) => {
        body.page = 0; //TODO Useful for pagination
        return API.search(body)
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
                <BackTop />
            </div>
        );
    }
}

class AdList extends React.Component {

    getProviderImageUrl(provider) {
        switch (provider) {
            case "lbc": return "https://sitinweb.fr/blog/data/medias/leboncoin.png"
        }
    }

    render() {
        return (
            <dl>
                {this.props.ads.map((ad, index) => {
                        const date = new Date(ad.release_date);
                        return <a key={index} href={ad.url} rel="noreferrer" target="_blank">
                            <dt className="AdItemContainer">
                                <img src={ad.thumb_urls[0]} className="AdItemImage"/>
                                <div className="AdItemTextContainer">
                                    <h4>{ad.title}</h4>
                                    <div>{ad.location.city} {ad.location.zipcode}</div>
                                    <div>{date.toLocaleDateString()} à {date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
                                    {ad.surface &&
                                    <p>{ad.surface} m²</p>
                                    }
                                </div>
                                <h3 className="price">{new Intl.NumberFormat(
                                    'fr-FR',
                                    {style: 'currency', currency: 'EUR', minimumFractionDigits: 0})
                                    .format(ad.price)}</h3>
                                <img src={this.getProviderImageUrl(ad.provider)} className="providerImage" />
                            </dt>
                        </a>
                    }
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