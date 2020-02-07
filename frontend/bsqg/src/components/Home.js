import React from 'react'
import 'firebase/auth';

class Home extends React.Component {
    render() {
        const user = this.props.user

        return (
            <div className="container" >
                <div className="col-xs-8 col-xs-offset-2 jumbotron text-center" >
                    <p><img src={user.photoURL} /> Hello, {this.props.user.displayName}</p>
                    <h4>User Data</h4>
                    <p>{JSON.stringify({user}, null, 2)}</p>
                </div>
            </div>
        )
    }
}
export default Home;