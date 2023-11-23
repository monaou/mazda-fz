import React from 'react';
import ClaimReward from '../hooks/ClaimReward';
import { useTasks } from "../hooks/useTask";
import { mode } from "../constants/modeConstants";

function Reward({ address, provider }) {
    const [tasks, loading] = useTasks(address, mode.REWARD);

    return (
        <div className="nft-list">
            {loading ? (
                <p>Loading NFTs...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>description</th>
                            <th>reward</th>
                            <th>created_time</th>
                            <th>end_time</th>
                            <th>link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.name}</td>
                                <td>{task.description}</td>
                                <td>{task.reward}</td>
                                <td>{task.created_time}</td>
                                <td>{task.end_time}</td>
                                <td>
                                    <ClaimReward contest={task} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Reward;
