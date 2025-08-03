package com.mis.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class GoogleTokenVerifierService {

    private final GoogleIdTokenVerifier verifier;

    // The Google Client ID is injected from application.properties
    public GoogleTokenVerifierService(@Value("${google.client.id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    /**
     * Verifies a Google ID token and returns the payload if valid.
     * @param idTokenString The ID token received from the frontend.
     * @return The payload of the verified token, containing user information.
     * @throws GeneralSecurityException if the token is invalid.
     * @throws IOException if there's an issue with network communication.
     */
    public GoogleIdToken.Payload verify(String idTokenString) throws GeneralSecurityException, IOException {
        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            throw new GeneralSecurityException("Invalid Google ID token.");
        }
        return idToken.getPayload();
    }
}
