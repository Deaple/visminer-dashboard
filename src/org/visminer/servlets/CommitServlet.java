package org.visminer.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.repositoryminer.persistence.handler.CommitDocumentHandler;


@WebServlet("/CommitServlet")
public class CommitServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private CommitDocumentHandler commitHandler = new CommitDocumentHandler();
	private PrintWriter out;
       
    public CommitServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("application/json");
		out = response.getWriter();				
		String action = request.getParameter("action");
		
		switch (action) {
			case "getAllByRepository":
				getAllByRepository(request.getParameter("repositoryId"));				
				break;
			default:
				break;
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
	}
	
	private void getAllByRepository(String repositoryId) {
		List<String> commitList = new ArrayList<>();
		commitHandler.getAllByRepository(repositoryId)
			.forEach(commit->commitList.add(commit.toJson()));		
		
		out.println(commitList.toString());		
	}

}
