import logo from './logo.svg';
import './App.css';
import web3 from "./web3";
import lottery from "./lottery";
import * as React from "react";


class App extends React.Component {
    state = {
        manager: '',
        players: [],
        balance: '',
        value: '',
        message: '',
    };

    async componentDidMount() {
        const [manager, players, balance] = await Promise.all([
            lottery.methods.manager().call(),
            lottery.methods.getPlayers().call(),
            web3.eth.getBalance(lottery.options.address)
        ]);
        this.setState({manager, players, balance});
    }

    pickWinner = async (event) => {
        try {
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            this.setState({message: 'Waiting on transaction success...'});
            await lottery.methods.pickWinner().send({
                from: accounts[0],
            });
            this.setState({message: 'Winner picked'});
        } catch (e) {
            console.error(e);
            this.setState({message: e.message});
        }
    }
    onEnter = async (event) => {
        event.preventDefault();

        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});


        try {
            this.setState({message: 'Waiting on transaction success...'});
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei(this.state.value, 'ether'),
            });
            this.setState({message: 'You have been entered!'});
        } catch (e) {
            console.error(e);
            this.setState({message: e.message});
        }
    }

    render() {
        return (
            <div>
                <h2>Lottery</h2>
                <p>Manager: {this.state.manager}</p>
                <p>People playing: {this.state.players.length}</p>
                <p>Current lottery balance: {web3.utils.fromWei(this.state.balance)}</p>
                <hr/>
                <form onSubmit={this.onEnter}>
                    <h4>Join the lottery</h4>
                    <div>
                        <label>Amount of ether</label>
                        <input
                            value={this.state.value}
                            onChange={event => this.setState({value: event.target.value})}
                        />
                    </div>
                    <button>Enter</button>
                </form>
                <hr/>
                <h4>Ready to pick a winner?</h4>
                <button onClick={this.pickWinner}>Pick a winner</button>
                <hr/>
                <h3>{this.state.message}</h3>
            </div>
        );
    }
}

export default App;
