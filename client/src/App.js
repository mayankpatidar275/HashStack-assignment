import React from 'react';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import Multisigabi from './contracts/Multisig.json';

function App() {
  useEffect(() => {
    loadWeb3();
    LoadBlockchaindata();
  }, [])

  const[Currentaccount, setCurrentaccount] = useState("");
  const[loader, setloader] = useState(true);
  const[Multisigsm, SetMultisigsm] = useState();
  const [transactions, setTransactions] = useState([]);

  const loadWeb3 = async () => {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3){
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying Metamask !"
      );
    }
  };

  const LoadBlockchaindata = async () =>{
    setloader(true);
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    setCurrentaccount(account);
    const networkId = await web3.eth.net.getId();
    const networkData = Multisigabi.networks[networkId];
  
    if(networkData){
      const multisig = new web3.eth.Contract(Multisigabi.abi, networkData.address);
      SetMultisigsm(multisig);
      // Fetch all transactions from the contract and store them in the transactions state
      const transactionCount = await multisig.methods.getTransactionsCount().call();
      const updatedTransactions = [];
      for (let i = 0; i < transactionCount; i++) {
        const transaction = await multisig.methods.getTransaction(i).call();
        updatedTransactions.push({
          id: i,
          addressTo: transaction.to,
          amount: web3.utils.fromWei(transaction.value.toString(), 'ether'),
          numConfirmations: transaction.numConfirmations,
          message: web3.utils.hexToUtf8(transaction.data)
        });
      }
      setTransactions(updatedTransactions);
      setloader(false);
    } else{
      window.alert("the smart contract is not deployed current network")
    }
  }

  const [inputValue, setInputValue] = React.useState('');
  const [addrInputValue, setAddrInputValue] = React.useState(0);
  const [data, setData] = useState('');
  const handleChange = (event) => {
    setInputValue(event.target.value);
  };
  const handleAddrChange = (event) => {
    setAddrInputValue(event.target.value);
  };
  const handleDataChange = (event) => {
    setData(event.target.value);
  };

  const submitTransfer = async e => {
    e.preventDefault();
    console.log("Submitting transaction...");
    // Call the submitTransaction function
    const to = Web3.utils.toChecksumAddress(addrInputValue);
    const value = Web3.utils.toWei(inputValue.toString(), 'ether');
    const datavar = Web3.utils.asciiToHex(data);
    try {
      await Multisigsm.methods.submitTransaction(to, value, datavar).send({ from: Currentaccount });
      console.log("Transaction submitted successfully");
    } catch (error) {
      console.log(`Error submitting transaction: ${error.message}`);
    }
  };

// TransactionList :-
async function confirmAndExecuteTransaction(transactionId) {
  // Call the confirmationTransaction function of the contract
  await Multisigsm.methods.confirmationTransaction(transactionId).send({ from: Currentaccount });

}

async function executeTransaction(transactionId, transactionAddr, transactionAmount) {
  // Check if the required number of confirmations have been reached
  const transaction = await Multisigsm.methods.transactions(transactionId).call();
  const numConfirmations = transaction.numConfirmations;
  const numConfirmationRequired = await Multisigsm.methods.numConfirmationRequired().call();
  if (numConfirmations >= numConfirmationRequired) {
    // Call the executeTransaction function of the contract
    try {
      const val = Web3.utils.toWei(transactionAmount.toString(), 'ether');
      await Multisigsm.methods.executeTransaction(transactionId, transactionAddr).send({ from: Currentaccount, value: val});
    } catch (error) {
      console.log(error);
    }
  }
}

  return (
    <div>
          <div className="container">
          <div className="form-group">
            <label>Address of recepient :</label>
            <input type="text" value={addrInputValue} onChange={handleAddrChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Amount in ETH :</label>
            <input type="text" value={inputValue} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Data :</label>
            <input type="text" value={data} onChange={handleDataChange} className="form-control" />
          </div>
          <div className="btn-group-vertical d-flex align-items-center" role="group">
            <button className="btn btn-primary mx-1 m-1" onClick={submitTransfer}>Transfer</button>
            <button className="btn btn-success mx-1 m-1">Revoke</button>
          </div>
        </div>

        <div className="btn-group-vertical d-flex align-items-center">
          <p>Your address: {Currentaccount} </p>
        </div>

        
        <div className="m-5">
            <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                        <th>Transaction ID</th>
                        <th>Address To</th>
                        <th>Amount</th>
                        <th>Number of Confirmations</th>
                        <th>Message</th>
                        <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td>{transaction.addressTo}</td>
                            <td>{transaction.amount}</td>
                            <td>{transaction.numConfirmations}</td>
                            <td>{transaction.message}</td>
                            <td>
                                {/* <button>Confirm</button> */}
                            <button onClick={() => confirmAndExecuteTransaction(transaction.id)}>Confirm</button>
                            <button onClick={() => executeTransaction(transaction.id, transaction.addressTo, transaction.amount)}>Execute</button>
                            
                            </td>
                        </tr>
                        ))}
                    </tbody>
            </table>
        </div>


    </div>
  );
}

export default App;
