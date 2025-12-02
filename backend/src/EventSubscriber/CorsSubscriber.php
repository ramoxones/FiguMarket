<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\Response;

class CorsSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 100],
            KernelEvents::RESPONSE => ['onKernelResponse', 0],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }
        $request = $event->getRequest();
        if ($request->getMethod() !== 'OPTIONS') {
            return;
        }
        $response = new Response();
        $this->applyHeaders($response);
        $response->setStatusCode(204);
        $event->setResponse($response);
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        $response = $event->getResponse();
        $this->applyHeaders($response);
    }

    private function applyHeaders(Response $response): void
    {
        $headers = $response->headers;
        $headers->set('Access-Control-Allow-Origin', '*');
        $headers->set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        $headers->set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        $headers->set('Access-Control-Max-Age', '86400');
    }
}