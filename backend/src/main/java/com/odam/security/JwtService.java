package com.odam.security;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import javax.crypto.SecretKey; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service; import java.nio.charset.StandardCharsets; import java.util.Date;
@Service public class JwtService {
 private final SecretKey key; private final long expiration;
 public JwtService(@Value("${odam.jwt.secret}") String secret,@Value("${odam.jwt.expiration-ms}") long expiration){ this.key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.expiration=expiration; }
 public String generate(String correo,String rol){ Date now=new Date(); return Jwts.builder().subject(correo).claim("correo",correo).claim("rol",rol).issuedAt(now).expiration(new Date(now.getTime()+expiration)).signWith(key).compact(); }
 public Jws<Claims> parse(String token){ return Jwts.parser().verifyWith(key).build().parseSignedClaims(token); }
 public String correo(String token){ return parse(token).getPayload().getSubject(); }
 public String rol(String token){ return parse(token).getPayload().get("rol",String.class); }
}
