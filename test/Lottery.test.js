const assert = require('assert')
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: '1000000'});
});

describe('Lottery contract', () => {
    it('should deploy a contract', () => {
        assert.ok(lottery.options.address);
    });
    describe('enter', () => {
        it('should allow accounts to enter', async () => {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether')
            });
            await lottery.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei('0.02', 'ether')
            });
            await lottery.methods.enter().send({
                from: accounts[2],
                value: web3.utils.toWei('0.02', 'ether')
            });
            const players = await lottery.methods.getPlayers().call({
                from: accounts[0],
            });

            assert.equal(accounts[0], players[0]);
            assert.equal(accounts[1], players[1]);
            assert.equal(accounts[2], players[2]);
            assert.equal(3, players.length);
        });
        it('should fail if small amount of ether sent', async () => {
            let success = false;
            try {
                await lottery.methods.enter().send({
                    from: accounts[0],
                    value: web3.utils.toWei('0.00999', 'ether')
                });
            } catch (err) {
                success = true;
            }
            assert(success);
        });
    });

    describe('pickWinner', () => {
        it('should fail if not manager call the method', async () => {
            let success = false;
            try {
                await lottery.methods.pickWinner().send({
                    from: accounts[1],
                });
            } catch (err) {
                success = true;
            }
            assert(success);
        });

        it('should send money to the winner', async () => {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('2', 'ether')
            });

            const balance = await web3.eth.getBalance(accounts[0]);

            await lottery.methods.pickWinner().send({
                from: accounts[0],
            });
            const finalBalance = await web3.eth.getBalance(accounts[0]);
            const difference = finalBalance - balance;
            assert(difference > web3.utils.toWei('1.8', 'ether'));

            const lotteryBalance = await web3.eth.getBalance(lottery.options.address);
            assert.equal(lotteryBalance, 0);
        });
    })

});
