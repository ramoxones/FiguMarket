<?php

namespace App\Service;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
    private string $secret;
    private string $issuer;
    private int $ttlSeconds;

    public function __construct()
    {
        $this->secret = $_ENV['JWT_SECRET'] ?? 'dev_secret_change_me';
        $this->issuer = $_ENV['JWT_ISSUER'] ?? 'figumarket';
        $this->ttlSeconds = (int)($_ENV['JWT_TTL'] ?? 3600 * 24 * 7); // 7 días por defecto
    }

    public function createToken(array $claims): string
    {
        $now = time();
        $payload = array_merge([
            'iss' => $this->issuer,
            'iat' => $now,
            'exp' => $now + $this->ttlSeconds,
        ], $claims);
        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function verifyToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            // Convert stdClass to array
            return json_decode(json_encode($decoded), true);
        } catch (\Throwable $e) {
            return null;
        }
    }
}