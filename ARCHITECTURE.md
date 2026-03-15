This project is currently built as a prototype, but I also thought about how the system could evolve if ArvyaX had to support a much larger number of users (for example, around 100k active users).

1. Scaling to 100k Users

Right now the project uses SQLite, which works well for a prototype because it is simple and lightweight. However, SQLite locks the entire database during write operations, so it would not perform well if many users were writing data at the same time.

If the application scaled up, I would migrate the database to PostgreSQL, preferably a managed cloud instance. I would also containerize the Node.js backend using Docker and deploy multiple backend instances behind a load balancer so traffic can be distributed evenly. This setup would make the system much more scalable and reliable.

2. Reducing LLM Costs

Currently, the application sends journal entries to the LLM for analysis in real time. While this works for a small number of users, the API cost could become high if the user base grows.

To reduce this, I would introduce a message queue using tools like Redis or RabbitMQ. Instead of processing every entry immediately, user entries could be stored first and then processed by background workers. These workers could batch requests and send them to Gemini with optimized prompts, which would reduce the number of API calls and lower the overall cost.

3. Caching Repeated Analysis

For this prototype, I implemented a simple in-memory cache using a JavaScript Map().

In a production environment, I would replace this with Redis. The backend could generate a SHA-256 hash of the sanitized journal text and use it as a cache key. Before sending a request to Gemini, the system would check Redis for an existing result. If the same text has already been analyzed, the cached result can be returned instantly. This would reduce both latency and API usage.

4. Protecting Sensitive Journal Data

Since journal entries may contain personal thoughts and emotions, protecting user data is very important.

In a production system, I would ensure that database storage is encrypted at rest using AES-256. Before sending any text to the Gemini API, the text should also go through a sanitization step to remove personally identifiable information (PII) such as names, phone numbers, or locations. This helps protect user privacy while still allowing the AI to analyze the content.