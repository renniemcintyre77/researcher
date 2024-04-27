import Agent from './agent';
declare class Team {
    name: string;
    description: string;
    members: Agent[];
    constructor(name: string, description: string, members: Agent[]);
}
export default Team;
