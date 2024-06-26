# Function to start a node service and store its PID
start_node_service() {
  local service_dir=$1
  local service_name=$2

  echo "Starting $service_name..."
  cd $service_dir || exit
  npm install
  node ${service_name}Main.js &
  local pid=$!
  echo "$service_name started with PID $pid"
  echo "$pid" >> /tmp/node_service_pids.txt
  cd - || exit
}

# Paths to services
CHATBOT_DIR="./ChatBot-Service"
EXERCISES_DIR="./Exercises-Service"
RECIPE_DIR="./Recipe-Service"
TRAININGS_DIR="./Trainings-Service"
USERS_DIR="./Users-Service"

# Clear previous PIDs file
echo "" > /tmp/node_service_pids.txt

# Start each service
start_node_service "$CHATBOT_DIR" "Chat"
start_node_service "$EXERCISES_DIR" "Excercises"
start_node_service "$RECIPE_DIR" "Recipe"
start_node_service "$TRAININGS_DIR" "Trainings"
start_node_service "$USERS_DIR" "Users"

echo "All services started."
