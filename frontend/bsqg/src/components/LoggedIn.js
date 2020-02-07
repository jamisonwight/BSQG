import React from 'react'

class LoggedIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jokes: []
        }
    }

    render() {
        return (
            <div className="container">
                <div className="col-lg-12">
                    <br />
                    <span className="pull-right"><a onClick={this.logout}>Log out</a></span>
                    <h2>Peeny Board</h2>
                    
                </div>
            </div>
        )
    }
}
export default LoggedIn;