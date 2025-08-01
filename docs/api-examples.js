/**
 * API Examples and Route Documentation for PaveMaster Suite
 * This file contains JSDoc comments that define API endpoints for documentation generation
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@pavemaster.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 expires_in:
 *                   type: integer
 *                   description: Token expiration time in seconds
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     description: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newuser@pavemaster.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "SecurePassword123!"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               company:
 *                 type: string
 *                 example: "ABC Paving LLC"
 *               role:
 *                 type: string
 *                 enum: [admin, manager, crew, driver]
 *                 example: "manager"
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "Registration successful"
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve a list of all projects with optional filtering
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, in-progress, completed, on-hold]
 *         description: Filter by project status
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: Filter by client name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                     items_per_page:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new project
 *     description: Create a new project with the provided details
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - client_name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Main Street Resurfacing"
 *               description:
 *                 type: string
 *                 example: "Complete resurfacing of Main Street from 1st to 10th Avenue"
 *               client_name:
 *                 type: string
 *                 example: "City of Springfield"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-15"
 *               budget:
 *                 type: number
 *                 format: decimal
 *                 example: 250000.00
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Get project by ID
 *     description: Retrieve detailed information about a specific project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update project
 *     description: Update an existing project with new information
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planning, in-progress, completed, on-hold]
 *               end_date:
 *                 type: string
 *                 format: date
 *               budget:
 *                 type: number
 *                 format: decimal
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete project
 *     description: Delete a project and all associated data
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       204:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     summary: Get all equipment
 *     description: Retrieve a list of all equipment with optional filtering
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, in-use, maintenance, retired]
 *         description: Filter by equipment status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by equipment type
 *     responses:
 *       200:
 *         description: List of equipment
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipment'
 *   post:
 *     summary: Add new equipment
 *     description: Add new equipment to the fleet
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - model
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Asphalt Paver #1"
 *               type:
 *                 type: string
 *                 example: "Paver"
 *               model:
 *                 type: string
 *                 example: "CAT AP1055F"
 *               purchase_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-15"
 *     responses:
 *       201:
 *         description: Equipment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 */

/**
 * @swagger
 * /api/fleet:
 *   get:
 *     summary: Get fleet vehicles
 *     description: Retrieve a list of all fleet vehicles with current status and location
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, in-use, maintenance, retired]
 *         description: Filter by vehicle status
 *       - in: query
 *         name: driver
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by assigned driver
 *     responses:
 *       200:
 *         description: List of fleet vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */

/**
 * @swagger
 * /api/fleet/{vehicleId}/location:
 *   get:
 *     summary: Get vehicle location
 *     description: Get current GPS location of a specific vehicle
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle location data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicle_id:
 *                   type: string
 *                   format: uuid
 *                 latitude:
 *                   type: number
 *                   format: decimal
 *                   example: 40.7128
 *                 longitude:
 *                   type: number
 *                   format: decimal
 *                   example: -74.0060
 *                 speed:
 *                   type: number
 *                   format: decimal
 *                   example: 45.5
 *                 heading:
 *                   type: number
 *                   format: decimal
 *                   example: 180.0
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 accuracy:
 *                   type: number
 *                   format: decimal
 *                   example: 5.0
 *       404:
 *         description: Vehicle not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, crew, driver]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running and healthy
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 *                 redis:
 *                   type: string
 *                   enum: [connected, disconnected]
 */