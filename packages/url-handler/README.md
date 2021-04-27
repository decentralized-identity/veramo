# Veramo URL handler

This is an implementation of `AbstractMessageHandler` that can interpret messages presented as a URL.

This is done either by attempting to extract a `c_i` param from the URL query string or by fetching the given URL. This also looks for a URL redirect and attempts to extract the parameter from the redirected URL.
