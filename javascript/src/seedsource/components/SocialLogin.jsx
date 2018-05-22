import React from 'react'
import facebook from '../../../images/facebook.png'
import twitter from '../../../images/twitter.png'
import google from '../../../images/google.png'

const SocialLogin = () => <div>
    <div className="title has-text-centered has-text-grey is-7">Or sign in with:</div>
    <div className="has-text-centered">
        <a href="/accounts/login/google-oauth2/"><img src={google} /></a>
        <a href="/accounts/login/facebook/" className="margin-left-5 margin-right-5">
            <img src={facebook} />
        </a>
        <a href="/accounts/login/twitter/"><img src={twitter} /></a>
    </div>
</div>



export default SocialLogin
