import React from 'react'
import { staticResource } from '../../utils'

const SocialLogin = () => <div>
    <div className="title has-text-centered has-text-grey is-7">Or sign in with:</div>
    <div className="has-text-centered">
        <a href="/accounts/login/google-oauth2/"><img src={staticResource('images/google.png')} /></a>
        <a href="/accounts/login/facebook/" className="margin-left-5 margin-right-5">
            <img src={staticResource('images/facebook.png')} />
        </a>
        <a href="/accounts/login/twitter/"><img src={staticResource('images/twitter.png')} /></a>
    </div>
</div>



export default SocialLogin
