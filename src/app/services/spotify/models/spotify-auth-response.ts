import { JsonObject } from '@app/library/json/decorators/json-object';
import { JsonProperty } from '@app/library/json/decorators/json-property';

@JsonObject()
export class SpotifyAuthResponse {
    @JsonProperty('access_token')
    public accessToken: string = null!;

    @JsonProperty('token_type')
    public tokenType: string = null!;

    @JsonProperty('expires_in')
    public expiresIn: number = null!;
}
