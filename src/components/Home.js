// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <h1>Welcome to MazdaFanZone</h1>
            <div className="info-card">
                <p>Supported Chain: <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer">Polygon Munbai</a></p>
                <p>Payments: <a href="https://usdcfaucet.com/" target="_blank" rel="noopener noreferrer">USDC</a></p>
            </div>

            <div className="feature-cards">
                <div className="feature-card">
                    <Link to="/tasks" className="feature-title-link">
                        <h2>Tasks</h2>
                    </Link>
                    <p>View and participate in a variety of tasks available in the NFT ecosystem.</p>
                </div>

                <div className="feature-card">
                    <Link to="/labeling-reward" className="feature-title-link">
                        <h2>Task Rewards</h2>
                    </Link>
                    <p>Earn rewards by completing tasks and contributing to the community.</p>
                </div>

                <div className="feature-card">
                    <Link to="/you-tasks" className="feature-title-link">
                        <h2>Labels</h2>
                    </Link>
                    <p>Manage your tasks, keep track of your progress, and engage with the community.</p>
                </div>

                <div className="feature-card">
                    <Link to="/labeling-nft" className="feature-title-link">
                        <h2>Label NFTs</h2>
                    </Link>
                    <p>Own a piece of the community's efforts by holding unique NFTs representing your contributions.</p>
                </div>
            </div>
        </div>
    );
}

export default Home;
