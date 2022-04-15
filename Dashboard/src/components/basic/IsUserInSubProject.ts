import { User } from '../../config';

// Description: Checks if the current user in the subProject.
// Params
// params 1: props
// returns JSX.Element or NULL
export default function IsUserInSubProject(subProject: $TSFixMe): void {
    const userId: $TSFixMe = User.getUserId();
    return (
        [null, undefined].every(i => {
            return i !== userId;
        }) &&
        [null, undefined].every(i => {
            return i !== subProject;
        }) &&
        [null, undefined].every(i => {
            return i !== subProject.users;
        }) &&
        subProject.users.length > 0 &&
        subProject.users.some((user: $TSFixMe) => {
            return user.userId === userId;
        })
    );
}
