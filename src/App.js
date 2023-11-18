import React, { useState } from "react";
import { ethers } from 'ethers';
import Creater from './components/Creater'
import Reward from './components/Reward'
import Voter from './components/Voter'
import Organizer from './components/Organizer'
import Home from './components/Home'
import { connectMetaMask, disconnectMetaMask } from "./components/wallet";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
// CSSをインポート
import './App.css';

function App() {
  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [warning, setWarning] = useState(null);


  const handleConnectWallet = async () => {
    try {
      if (provider) {
        const connectedAddress = await connectMetaMask(provider);
        setAddress(connectedAddress.address);
        setChainId(connectedAddress.chainId);

        if (connectedAddress.chainId !== 80001) {
          setWarning("Warning: Please switch to Matic Mumbai (Chain ID: 80001).");
        } else {
          setWarning(null);
        }
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      await disconnectMetaMask(provider);
      setAddress(null);
      setChainId(null);
      setWarning(null);
    } catch (error) {
      console.error("Error disconnecting from MetaMask:", error);
    }
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>
            MazdaFanZone
          </h1>
          <div className="wallet-info">
            {address
              ? <>
                <span>Address: {`${address.slice(0, 4)}...${address.slice(-4)}`}</span>
                <span>Chain: {chainId}</span>
                <button onClick={handleDisconnectWallet}>Disconnect</button>
              </>
              : <button onClick={handleConnectWallet}>Connect Wallet</button>
            }
          </div>
        </header>
        {warning && <div className="warning-message">{warning}</div>}
        <nav className="navbar">
          <Link className="nav-button" to="/">Home</Link>
          <Link className="nav-button" to="/organizer">Organizer</Link>
          <Link className="nav-button" to="/creater">Creater</Link>
          <Link className="nav-button" to="/voter">Voter</Link>
          <Link className="nav-button" to="/reward">Reward</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/organizer" element={<Organizer address={address} provider={provider} />} />
          <Route path="/creater" element={<Creater address={address} provider={provider} />} />
          <Route path="/voter" element={<Voter address={address} provider={provider} />} />
          <Route path="/reward" element={<Reward address={address} provider={provider} />} />
        </Routes>
      </div>
      <div className="footer">
        <Link className="footer-link" to="/discord">Discord</Link>
        <Link className="footer-link" to="/document">Document</Link>
        <span className="footer-copyright">&copy; 2023 MazdaFanZone</span>
      </div>

    </Router>
  );
}

export default App;
