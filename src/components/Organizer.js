import React from 'react';
import TaskStoping from '../hooks/TaskStoping';
import TaskRegistration from '../hooks/TaskRegistration';
import { useTasks } from "../hooks/useTask";
import { mode } from "../constants/modeConstants";

function Organizer({ address, provider }) {
    const [tasks, loading] = useTasks(address, mode.TASK);

    return (
        <div className="nft-list">
            <TaskRegistration />
            {loading ? (
                <p>Loading NFTs...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>名前</th>
                            <th>説明</th>
                            <th>報酬</th>
                            <th>作成日</th>
                            <th>リンク</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.name}</td>
                                <td>{task.description}</td>
                                <td>{task.reward}</td>
                                <td>{task.created_time}</td>
                                <td>
                                    <TaskStoping task={task} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Organizer;
