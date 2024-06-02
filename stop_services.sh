# Function to stop all node services using the stored PIDs
stop_node_services() {
  if [ -f /tmp/node_service_pids.txt ]; then
    while IFS= read -r pid; do
      echo "Stopping process with PID $pid"
      kill "$pid"
    done < /tmp/node_service_pids.txt
    rm /tmp/node_service_pids.txt
    echo "All services stopped."
  else
    echo "No running services found."
  fi
}

stop_node_services
