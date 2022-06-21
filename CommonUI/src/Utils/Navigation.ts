import Route from 'Common/Types/API/Route';
import { NavigateFunction, Location } from 'react-router-dom';
import URL from 'Common/Types/API/URL';

abstract class Navigation {
    private static navigateHook: NavigateFunction;
    private static location: Location;

    public static setNavigateHook(navigateHook: NavigateFunction): void {
        this.navigateHook = navigateHook;
    }

    public static setLocation(location: Location): void {
        this.location = location;
    }

    public static getLocation(): Route {
        return new Route(this.location.pathname);
    }

    public static navigate(to: Route | URL): void {
        if (this.navigateHook && to instanceof Route) {
            this.navigateHook(to.toString());
        }

        // if its an external link outside of react. 
        if (to instanceof URL) {
            window.location.href = to.toString();
        }
    }
}

export default Navigation;
